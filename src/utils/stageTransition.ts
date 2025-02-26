import { Stage, AssessmentState, StageValidationResult } from '../types';
import { trackStageTransition } from './analytics';

const VALID_STAGES: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];

export function validateStageTransition(
  currentStage: Stage | null,
  targetStage: Stage
): StageValidationResult {
  // Allow starting from any stage if no current stage
  if (!currentStage) {
    return { isValid: true, nextStage: targetStage };
  }

  const currentIndex = VALID_STAGES.indexOf(currentStage);
  const targetIndex = VALID_STAGES.indexOf(targetStage);

  // Invalid stage identifiers
  if (currentIndex === -1 || targetIndex === -1) {
    return {
      isValid: false,
      error: 'Invalid stage identifier'
    };
  }

  // Allow:
  // 1. Moving to next stage (index difference = 1)
  // 2. Moving to any previous stage
  // 3. Staying in current stage
  if (
    targetIndex - currentIndex === 1 || // Next stage
    targetIndex <= currentIndex // Previous or same stage
  ) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: 'Cannot skip stages forward'
  };
}

export async function transitionStage(
  state: AssessmentState,
  targetStage: Stage
): Promise<AssessmentState> {
  const validationResult = validateStageTransition(state.currentStage, targetStage);
  
  if (!validationResult.isValid) {
    throw new Error(validationResult.error);
  }

  // Track analytics before state update
  if (state.currentStage) {
    trackStageTransition(state.currentStage, targetStage);
  }

  return {
    ...state,
    currentStage: targetStage,
    metadata: {
      ...state.metadata,
      lastTransition: new Date().toISOString(),
      stageStartTime: Date.now()
    }
  };
}