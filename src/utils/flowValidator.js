import { stages, categories } from '../data/categories';
import { getAssessmentResponses, getAssessmentMetadata } from '../utils/storage';

/**
 * FLOW_STATES represents the different states of the user flow.
 * - STAGE_SELECT: The user is selecting a stage.
 * - ASSESSMENT: The user is taking an assessment.
 * - SUMMARY: The user is viewing a summary of their assessment.
 * - RESULTS: The user is viewing the results of their assessment.
 */
export const FLOW_STATES = {
  STAGE_SELECT: 'stage_select',
  ASSESSMENT: 'assessment',
  SUMMARY: 'summary',
  RESULTS: 'results'
};

// Keep track of navigation state
// FLOW_STATES is already declared below

const allQuestions = Object.values(categories).flatMap(category => category.questions);


const validateScoreCalculation = (responses, stage) => {
  const validScores = Object.values(responses).every(score => 
    Number.isInteger(score) && score >= 1 && score <= 4
  );

  if (!validScores) {
    return { isValid: false, error: 'Invalid score values' };
  }

  return { isValid: true };
};

const validateAssessmentCompletion = (responses, stage) => {
  const stageQuestions = allQuestions.filter(q => q.stages.includes(stage));

  const completionRate = Object.keys(responses).length / stageQuestions.length;
  const metadata = getAssessmentMetadata();

  return {
    isValid: true,
    completionRate,
    lastSaved: metadata?.lastSaved,
    questionCount: metadata?.questionCount
  };
};

export const validateUserFlow = () => {
  const responses = getAssessmentResponses();
  const metadata = getAssessmentMetadata();
  
  if (!metadata || typeof metadata !== 'object' || !metadata.stage) {
    return { isValid: false, error: 'Missing stage information' };
  }

  const stageValidation = validateStageTransition(metadata.stage, responses);
  if (!stageValidation.isValid) {
    return stageValidation;
  }

  const scoreValidation = validateScoreCalculation(responses, metadata.stage);
  if (!scoreValidation.isValid) {
    return scoreValidation;
  }

  return validateAssessmentCompletion(responses, metadata.stage);
};

export const validateResponses = (responses) => {
  if (!responses || typeof responses !== 'object') {
    return { isValid: false, error: 'Invalid response format' };
  }

  const validationResults = {
    isValid: true,
    issues: [],
    warnings: []
  };

  Object.entries(responses).forEach(([questionId, value]) => {
    // Validate question exists
    const question = allQuestions.find(q => q.id === questionId);

    if (!question) {
      validationResults.issues.push(`Invalid question ID: ${questionId}`);
      validationResults.isValid = false;
      return;
    }

    // Validate score range
    if (!Number.isInteger(value) || value < 1 || value > 4) {
      validationResults.issues.push(`Invalid score for ${questionId}: ${value}`);
      validationResults.isValid = false;
    }
  });

  return validationResults;
};

/**
 * Simulates an error for a given component.
 * This function is used for testing error handling in different components.
 *
 * @param {string} component - The name of the component to simulate an error for.
 * @throws Will throw an error with a message specific to the component.
 */
export const simulateComponentError = (component) => {
  switch (component) {
    case 'Assessment':
      throw new Error('Simulated Assessment error');
    default:
      throw new Error(`Simulated error for ${component}`);
  }
};

const validateStageProgress = (currentStage, nextStage) => {
  // Define the order of stages
  const stageOrder = ['pre-seed', 'seed', 'series-a'];
  
  // Get the index of the current and next stages in the stage order
  const currentIndex = stageOrder.indexOf(currentStage);
  const nextIndex = stageOrder.indexOf(nextStage);
  
  // Check if either stage is invalid (not found in the stage order)
  if (currentIndex === -1 || nextIndex === -1) {
    return { isValid: false, error: 'Invalid stage' };
  }

  // Allow moving forward one stage at a time or starting from any stage
  // If currentIndex is -1, it means the current stage is not set, so any next stage is valid
  if (currentIndex === -1 || nextIndex - currentIndex === 1 || !currentStage) {
    return { isValid: true };
  }

  // If none of the above conditions are met, the stage progression is invalid
  return { 
    isValid: false, 
    error: 'Invalid stage progression' 
  };
};

const validateStageResponses = (responses, stage) => {
  if (!responses || typeof responses !== 'object') {
    return { isValid: false, error: 'Invalid responses format' };
  }

  const stageQuestions = allQuestions.filter(q => q.stages.includes(stage));
  const stageQuestionIds = new Set(stageQuestions.map(q => q.id));

  // Validate no responses exist for questions not in this stage
  const invalidQuestions = Object.keys(responses).filter(qId => !stageQuestionIds.has(qId));
  if (invalidQuestions.length > 0) {
    return {
      isValid: false,
      error: 'Responses found for questions not in current stage',
      details: invalidQuestions
    };
  }

  const requiredQuestions = stageQuestions.filter(q => !q.optional).map(q => q.id);
  const missingRequired = requiredQuestions.filter(qId => !responses[qId]);

  if (missingRequired.length > 0) {
    return {
      isValid: false,
      error: 'Missing required questions',
      details: missingRequired
    };
  }

  return { isValid: true };
};

export const validateStageTransition = (currentStage, nextStage, responses) => {
  if (!responses) {
    responses = getAssessmentResponses() || {};
  }

  const progressValidation = validateStageProgress(currentStage, nextStage);
  if (!progressValidation.isValid) {
    return progressValidation;
  }

  // Only validate responses if we're moving forward and have a current stage
  if (currentStage && nextStage) {
    const responseValidation = validateStageResponses(responses, currentStage);
    if (!responseValidation.isValid) {
      return responseValidation;
    }
  }

  return { isValid: true };
};

export const validateFlowState = (currentState, nextState) => {
  const validFlow = [
    FLOW_STATES.STAGE_SELECT,
    FLOW_STATES.ASSESSMENT,
    FLOW_STATES.SUMMARY,
    FLOW_STATES.RESULTS
  ];

  const currentIndex = validFlow.indexOf(currentState);
  const nextIndex = validFlow.indexOf(nextState);

  // Allow backwards navigation or sequential progression
  if (nextIndex < currentIndex || nextIndex === currentIndex + 1) {
    return { isValid: true };
  }

  return { 
    isValid: false, 
    error: 'Invalid flow transition' 
  };
};

export const getResumableState = () => {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    
    const stored = sessionStorage.getItem('octoflow');
    if (!stored) return null;

    const state = JSON.parse(stored);
    const { stage, responses, currentState } = state;

    // Validate stored state
    if (!stage || !stages.find(s => s.id === stage)) {
      return null;
    }

    // Validate responses if they exist
    if (responses) {
      const validResponses = Object.entries(responses).every(([qId, value]) => {
        const question = allQuestions.find(q => q.id === qId);
        return question && value >= 1 && value <= 4;
      });

      if (!validResponses) {
        return null;
      }
    }

    // Validate flow state
    if (currentState && !Object.values(FLOW_STATES).includes(currentState)) {
      return null;
    }

    return { stage, responses, currentState };
  } catch (e) {
    return null;
  }
};