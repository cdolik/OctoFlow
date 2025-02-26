import { Stage, StorageState } from '../types';
import { getAssessmentResponses, getAssessmentMetadata } from './storage';
import { calculateStageScores } from './scoring';
import { stages as stageDefinitions } from '../data/stages';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: string[];
  redirectTo?: string;
}

export const getResumePoint = (): {
  stage: Stage | null;
  questionIndex: number;
  completed: boolean;
} => {
  const responses = getAssessmentResponses();
  const metadata = getAssessmentMetadata();
  
  if (!metadata?.stage || !responses) {
    return { stage: null, questionIndex: 0, completed: false };
  }

  const answeredQuestions = Object.keys(responses).length;
  const totalQuestions = metadata.questionCount || 0;
  
  return {
    stage: metadata.stage as Stage,
    questionIndex: answeredQuestions,
    completed: answeredQuestions === totalQuestions
  };
};

export const validateStageProgression = (
  currentStage: Stage | null, 
  targetStage: Stage
): ValidationResult => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = currentStage ? stages.indexOf(currentStage) : -1;
  const targetIndex = stages.indexOf(targetStage);

  // Allow starting at any stage if no current stage
  if (!currentStage) {
    return { isValid: true };
  }

  if (targetIndex === -1) {
    return {
      isValid: false,
      error: 'Invalid stage identifier',
      details: ['Stage does not exist']
    };
  }

  // Allow:
  // 1. Moving to next stage
  // 2. Moving to any previous stage
  // 3. Staying in current stage
  if (
    targetIndex === currentIndex + 1 || // Next stage
    targetIndex <= currentIndex || // Previous stage or current stage
    currentIndex === -1 // First stage selection
  ) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: 'Cannot skip stages forward',
    details: ['Must complete stages in order'],
    redirectTo: `/assessment/${currentStage}`
  };
};

export const getNextStage = (currentStage: Stage): Stage | null => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};

export const getPreviousStage = (currentStage: Stage): Stage | null => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex > 0 ? stages[currentIndex - 1] : null;
};

export const validateStageCompletion = (stage: Stage, responses: Record<string, number>): ValidationResult => {
  const stageQuestions = getStageQuestions(stage);
  const totalScore = stageQuestions.reduce((acc, question) => acc + (responses[question.id] || 0), 0);
  const stageConfig = getStageConfig(stage);

  if (totalScore < stageConfig.scoringCriteria.threshold) {
    return {
      isValid: false,
      error: 'Score below required threshold',
      details: [`Minimum required score: ${stageConfig.scoringCriteria.threshold}`, `Your score: ${totalScore}`]
    };
  }

  return { isValid: true };
};

export function validateStageRequirements(
  stage: Stage,
  questions: Question[],
  responses: Record<string, number>
): ValidationResult {
  const stageQuestions = questions.filter(q => q.stages.includes(stage));
  const requiredResponses = new Set(stageQuestions.map(q => q.id));
  const providedResponses = new Set(Object.keys(responses));

  const missingResponses = Array.from(requiredResponses)
    .filter(id => !providedResponses.has(id));

  if (missingResponses.length > 0) {
    return {
      isValid: false,
      error: 'Missing responses',
      details: missingResponses.map(id => 
        `Question ${id} requires a response`
      )
    };
  }
  
  // Check score threshold
  const stageConfig = stageDefinitions.find(s => s.id === stage);
  if (stageConfig && stageConfig.scoringCriteria?.threshold) {
    const scores = calculateStageScores(stage, responses);
    if (scores.overallScore < stageConfig.scoringCriteria.threshold) {
      return {
        isValid: false,
        error: 'Score below threshold',
        details: [`Current score: ${scores.overallScore.toFixed(1)}, required: ${stageConfig.scoringCriteria.threshold}`]
      };
    }
  }

  return { isValid: true };
}
