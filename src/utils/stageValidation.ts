import { Stage, Question, ValidationResult } from '../types';
import { stages } from '../data/stages';
import { getAssessmentResponses } from './storage';

export interface StageValidationOptions {
  requireComplete?: boolean;
  validateResponses?: boolean;
}

export const validateStageProgression = (
  currentStage: Stage | null,
  targetStage: Stage,
  options: StageValidationOptions = {}
): ValidationResult => {
  const stageOrder = stages.map(s => s.id);
  const currentIndex = currentStage ? stageOrder.indexOf(currentStage) : -1;
  const targetIndex = stageOrder.indexOf(targetStage);

  if (targetIndex === -1) {
    return {
      isValid: false,
      error: 'Invalid stage identifier'
    };
  }

  // Allow:
  // 1. First stage selection (no current stage)
  // 2. Moving to next stage
  // 3. Moving to any previous stage
  // 4. Staying in current stage
  if (
    currentIndex === -1 || 
    targetIndex - currentIndex === 1 || 
    targetIndex <= currentIndex
  ) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: `Cannot skip from ${currentStage} to ${targetStage}`,
    details: [`Please complete ${stages[currentIndex + 1].id} first`]
  };
};

export const validateStageResponses = (
  stage: Stage,
  responses: Record<string, number>,
  questions: Question[]
): ValidationResult => {
  const stageQuestions = questions.filter(q => q.stages.includes(stage));
  const requiredQuestions = stageQuestions.filter(q => !q.optional).map(q => q.id);
  
  // Check for missing required questions
  const missingRequired = requiredQuestions.filter(qId => !responses[qId]);
  if (missingRequired.length > 0) {
    return {
      isValid: false,
      error: 'Missing required questions',
      details: missingRequired
    };
  }

  // Validate response values
  const invalidResponses = Object.entries(responses)
    .filter(([qId, value]) => {
      const question = questions.find(q => q.id === qId);
      return !question || value < 1 || value > 4;
    })
    .map(([qId]) => qId);

  if (invalidResponses.length > 0) {
    return {
      isValid: false,
      error: 'Invalid response values',
      details: invalidResponses
    };
  }

  return { isValid: true };
};

export const getStageConfig = (stage: Stage) => {
  const config = stages.find(s => s.id === stage);
  if (!config) {
    throw new Error(`Invalid stage: ${stage}`);
  }
  return config;
};

export const getNextStage = (currentStage: Stage): Stage | null => {
  const stageOrder = stages.map(s => s.id);
  const currentIndex = stageOrder.indexOf(currentStage);
  return currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
};

export const getPreviousStage = (currentStage: Stage): Stage | null => {
  const stageOrder = stages.map(s => s.id);
  const currentIndex = stageOrder.indexOf(currentStage);
  return currentIndex > 0 ? stageOrder[currentIndex - 1] : null;
};