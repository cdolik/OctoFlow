import { Stage, StageValidationResult, Question } from '../types';
import { stages } from '../data/stages';
import { getAssessmentResponses } from './storage';
import { validateStageResponses } from './questionFilters';

export const validateStageProgression = (
  currentStage: Stage | null,
  targetStage: Stage
): StageValidationResult => {
  const stageOrder = stages.map(s => s.id);
  const currentIndex = currentStage ? stageOrder.indexOf(currentStage) : -1;
  const nextIndex = stageOrder.indexOf(targetStage);

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
    error: 'Cannot skip stages forward',
    details: ['Must complete stages in order']
  };
};

export const validateStageTransition = (
  currentStage: Stage | null,
  nextStage: Stage,
  stageQuestions: Question[],
  responses?: Record<string, number>
): StageValidationResult => {
  if (!responses) {
    responses = getAssessmentResponses() || {};
  }

  const progressValidation = validateStageProgression(currentStage, nextStage);
  if (!progressValidation.isValid) {
    return progressValidation;
  }

  // Only validate responses if we're moving forward and have a current stage
  if (currentStage && nextStage) {
    const responseValidation = validateStageResponses(
      responses,
      stageQuestions,
      currentStage
    );

    if (!responseValidation.isValid) {
      return {
        isValid: false,
        error: 'Incomplete stage responses',
        details: responseValidation.details,
        redirectTo: `/assessment/${currentStage}`
      };
    }
  }

  return { isValid: true };
};