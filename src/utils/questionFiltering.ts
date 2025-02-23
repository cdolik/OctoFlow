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

  const stageQuestions = filterQuestionsByStage(questions, stage);
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