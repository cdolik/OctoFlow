import { AssessmentState, AssessmentResponse, AssessmentValidation } from '../types/assessment';
import { Stage } from '../types';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateStorageState = (state: unknown): ValidationResult => {
  if (!state || typeof state !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid state format']
    };
  }

  const validState = state as AssessmentState;
  const errors: string[] = [];

  // Validate stage
  if (!validState.stage || !['pre-seed', 'seed', 'series-a', 'series-b'].includes(validState.stage)) {
    errors.push('Invalid stage value');
  }

  // Validate responses
  if (!validState.responses || typeof validState.responses !== 'object') {
    errors.push('Invalid responses format');
  } else {
    Object.entries(validState.responses).forEach(([key, response]) => {
      if (!validateResponse(response)) {
        errors.push(`Invalid response format for question ${key}`);
      }
    });
  }

  // Validate progress
  if (!validState.progress || typeof validState.progress !== 'object') {
    errors.push('Invalid progress format');
  } else {
    if (typeof validState.progress.questionIndex !== 'number') {
      errors.push('Invalid question index');
    }
    if (typeof validState.progress.totalQuestions !== 'number') {
      errors.push('Invalid total questions');
    }
    if (typeof validState.progress.isComplete !== 'boolean') {
      errors.push('Invalid completion status');
    }
    if (!validState.progress.lastUpdated || !isValidDateString(validState.progress.lastUpdated)) {
      errors.push('Invalid last updated timestamp');
    }
  }

  // Validate metadata
  if (!validState.metadata || typeof validState.metadata !== 'object') {
    errors.push('Invalid metadata format');
  } else {
    if (typeof validState.metadata.startTime !== 'number') {
      errors.push('Invalid start time');
    }
    if (typeof validState.metadata.lastInteraction !== 'number') {
      errors.push('Invalid last interaction time');
    }
    if (!Array.isArray(validState.metadata.completedCategories)) {
      errors.push('Invalid completed categories');
    }
    if (!validState.metadata.categoryScores || typeof validState.metadata.categoryScores !== 'object') {
      errors.push('Invalid category scores');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateResponse = (response: unknown): response is AssessmentResponse => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const resp = response as AssessmentResponse;
  return (
    typeof resp.value === 'number' &&
    resp.value >= 1 &&
    resp.value <= 4 &&
    typeof resp.timestamp === 'number' &&
    typeof resp.questionId === 'string' &&
    typeof resp.category === 'string' &&
    typeof resp.timeSpent === 'number'
  );
};

const isValidDateString = (date: string): boolean => {
  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed.getTime());
};

export const validateStorageVersion = (version: string): boolean => {
  const versionPattern = /^\d+\.\d+$/;
  return versionPattern.test(version);
};

export const validateStateTransition = (
  currentState: AssessmentState | null,
  newState: AssessmentState
): ValidationResult => {
  const errors: string[] = [];

  if (!currentState) {
    return validateStorageState(newState);
  }

  // Ensure responses aren't lost during transition
  const currentResponseKeys = Object.keys(currentState.responses);
  const newResponseKeys = Object.keys(newState.responses);
  
  if (currentResponseKeys.length > newResponseKeys.length) {
    errors.push('Response data would be lost in transition');
  }

  // Validate stage transition
  if (currentState.stage !== newState.stage) {
    const validTransition = validateStageTransition(currentState.stage, newState.stage as Stage);
    if (!validTransition) {
      errors.push('Invalid stage transition');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateStageTransition = (currentStage: Stage, newStage: Stage): boolean => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = stages.indexOf(currentStage);
  const newIndex = stages.indexOf(newStage);

  // Allow moving to next stage or any previous stage
  return newIndex <= currentIndex + 1;
};