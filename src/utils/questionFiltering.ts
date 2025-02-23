import { Stage, Question, StageValidationResult } from '../types';
import { getStageConfig } from '../data/StageConfig';

interface FilterOptions {
  requireCategory?: string;
  excludeCategories?: string[];
  minimumWeight?: number;
}

export const filterQuestionsByStage = (
  questions: Question[],
  stage: Stage,
  options: FilterOptions = {}
): Question[] => {
  const stageConfig = getStageConfig(stage);
  
  return questions.filter(question => {
    // Must be valid for this stage
    if (!question.stages.includes(stage)) return false;
    
    // Must pass stage-specific filter
    if (!stageConfig.questionFilter(question)) return false;
    
    // Apply optional category filters
    if (options.requireCategory && question.category !== options.requireCategory) return false;
    if (options.excludeCategories?.includes(question.category)) return false;
    
    // Apply optional weight filter
    if (options.minimumWeight && question.weight < options.minimumWeight) return false;
    
    return true;
  });
};

export const validateQuestionResponses = (
  responses: Record<string, number>,
  questions: Question[],
  stage: Stage
): StageValidationResult => {
  const stageQuestions = filterQuestionsByStage(questions, stage);
  const stageQuestionIds = new Set(stageQuestions.map(q => q.id));

  // Check for responses to questions not in this stage
  const invalidQuestions = Object.keys(responses)
    .filter(qId => !stageQuestionIds.has(qId));

  if (invalidQuestions.length > 0) {
    return {
      isValid: false,
      error: 'Invalid question responses detected',
      details: invalidQuestions
    };
  }

  // Check for missing required questions
  const missingQuestions = stageQuestions
    .filter(q => !responses[q.id])
    .map(q => q.id);

  if (missingQuestions.length > 0) {
    return {
      isValid: false,
      error: 'Missing required question responses',
      details: missingQuestions
    };
  }

  // Validate response values
  const invalidResponses = Object.entries(responses)
    .filter(([qId]) => stageQuestionIds.has(qId))
    .filter(([, value]) => !Number.isInteger(value) || value < 1 || value > 4)
    .map(([qId]) => qId);

  if (invalidResponses.length > 0) {
    return {
      isValid: false,
      error: 'Invalid response values detected',
      details: invalidResponses
    };
  }

  return { isValid: true };
};

export const getQuestionWeight = (question: Question, stage: Stage): number => {
  const stageConfig = getStageConfig(stage);
  const baseFocus = stageConfig.focus;
  
  // Questions in focus areas get higher weight
  const focusMultiplier = baseFocus.includes(question.category) ? 1.5 : 1;
  
  return question.weight * focusMultiplier;
};

export const calculateStageProgress = (
  responses: Record<string, number>,
  questions: Question[],
  stage: Stage
): number => {
  const stageQuestions = filterQuestionsByStage(questions, stage);
  const answeredCount = stageQuestions.filter(q => responses[q.id]).length;
  
  return answeredCount / stageQuestions.length;
};