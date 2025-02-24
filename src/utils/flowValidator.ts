import { Stage, StageValidationResult, Question, StorageState } from '../types';
import { getAssessmentResponses, getAssessmentMetadata } from './storage';
import { validateStageResponses } from './questionFilters';

export const FLOW_STATES = {
  INITIAL: 'initial',
  ASSESSMENT: 'assessment',
  REVIEW: 'review',
  COMPLETE: 'complete',
  ERROR: 'error'
} as const;

export type FlowState = typeof FLOW_STATES[keyof typeof FLOW_STATES];

export const validateStageProgress = (
  currentStage: Stage | null,
  nextStage: Stage
): StageValidationResult => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = currentStage ? stages.indexOf(currentStage) : -1;
  const nextIndex = stages.indexOf(nextStage);

  if (nextIndex === -1) {
    return {
      isValid: false,
      error: 'Invalid stage identifier',
      details: ['Stage does not exist']
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
    return { 
      isValid: true,
      details: ['Valid stage progression']
    };
  }

  return {
    isValid: false,
    error: 'Cannot skip stages forward',
    details: ['Must complete stages in order'],
    redirectTo: `/assessment/${currentStage}`
  };
};

export function validateStorageState(state: unknown): state is StorageState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const typedState = state as Partial<StorageState>;

  return !!(
    typedState.version &&
    typedState.responses &&
    typedState.metadata?.lastSaved &&
    typeof typedState.metadata.timeSpent === 'number' &&
    typeof typedState.metadata.attemptCount === 'number'
  );
}

export function validateStageTransition(
  currentStage: Stage | null,
  targetStage: Stage,
  state: StorageState | null
): StageValidationResult {
  const stageOrder: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  
  // Allow any stage if no current stage
  if (!currentStage) {
    return { isValid: true };
  }

  const currentIndex = stageOrder.indexOf(currentStage);
  const targetIndex = stageOrder.indexOf(targetStage);

  if (targetIndex === -1) {
    return {
      isValid: false,
      error: 'Invalid stage identifier',
      details: ['Stage does not exist']
    };
  }

  // Can't skip stages forward
  if (targetIndex > currentIndex + 1) {
    return {
      isValid: false,
      error: 'Cannot skip stages forward',
      details: ['Must complete stages in order'],
      redirectTo: `/assessment/${currentStage}`
    };
  }

  // Can move to next stage or any previous stage
  return { isValid: true };
}

export function validateStageRequirements(
  stage: Stage,
  questions: Question[],
  responses: Record<string, number>
): StageValidationResult {
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

  return { isValid: true };
}