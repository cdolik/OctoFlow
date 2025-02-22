import { Stage, Question, StageValidationResult } from '../types';
import { stages } from '../data/stages';

export const getStageQuestions = (stage: Stage, questions: Question[]): Question[] => {
  const stageDef = stages.find(s => s.id === stage);
  if (!stageDef) return [];
  
  return questions.filter(q => 
    q.stages.includes(stage) && 
    stageDef.questionFilter(q)
  );
};

export const validateStageResponses = (
  responses: Record<string, number> | null,
  questions: Question[],
  stage: Stage
): StageValidationResult => {
  if (!responses || typeof responses !== 'object') {
    return { 
      isValid: false, 
      error: 'Invalid responses format',
      details: ['No responses found']
    };
  }

  const stageQuestions = getStageQuestions(stage, questions);
  const stageQuestionIds = new Set(stageQuestions.map(q => q.id));

  // Check for responses to questions not in this stage
  const invalidQuestions = Object.keys(responses).filter(qId => !stageQuestionIds.has(qId));
  if (invalidQuestions.length > 0) {
    return {
      isValid: false,
      error: 'Responses found for questions not in current stage',
      details: invalidQuestions
    };
  }

  // Check for missing required questions
  const requiredQuestionIds = stageQuestions.map(q => q.id);
  const missingRequired = requiredQuestionIds.filter(qId => !responses[qId]);

  if (missingRequired.length > 0) {
    return {
      isValid: false,
      error: 'Missing required questions',
      details: missingRequired
    };
  }

  // Validate score ranges
  const invalidScores = Object.entries(responses)
    .filter(([qId]) => stageQuestionIds.has(qId))
    .filter(([, score]) => !Number.isInteger(score) || score < 1 || score > 4)
    .map(([qId]) => qId);

  if (invalidScores.length > 0) {
    return {
      isValid: false,
      error: 'Invalid score values',
      details: invalidScores
    };
  }

  return { isValid: true };
};