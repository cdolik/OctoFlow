import { Stage, StageValidationResult } from '../types';
import { stages } from '../data/stages';
import { questions } from '../data/questions';
import { getAssessmentResponses } from './storage';
import { validateStageResponses } from './questionFilters';

export const validateStageProgress = (
  currentStage: Stage | null,
  nextStage: Stage
): StageValidationResult => {
  const stageOrder = stages.map(s => s.id);
  const currentIndex = currentStage ? stageOrder.indexOf(currentStage) : -1;
  const nextIndex = stageOrder.indexOf(nextStage);

  // Invalid stage identifier
  if (nextIndex === -1) {
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
    nextIndex - currentIndex === 1 || 
    nextIndex <= currentIndex
  ) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: 'Invalid stage progression',
    details: ['Cannot skip stages forward']
  };
};

export const validateStageTransition = (
  currentStage: Stage | null,
  nextStage: Stage,
  responses?: Record<string, number>
): StageValidationResult => {
  if (!responses) {
    responses = getAssessmentResponses() || {};
  }

  const progressValidation = validateStageProgress(currentStage, nextStage);
  if (!progressValidation.isValid) {
    return progressValidation;
  }

  // Only validate responses if we're moving forward and have a current stage
  if (currentStage && nextStage) {
    const stageQuestions = questions.filter(q => q.stages.includes(currentStage));
    const responseValidation = validateStageResponses(
      responses,
      stageQuestions,
      currentStage
    );

    if (!responseValidation.isValid) {
      return responseValidation;
    }
  }

  return { isValid: true };
};