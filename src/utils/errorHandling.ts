import { 
  AssessmentError,
  ValidationError,
  StorageError,
  NavigationError,
  StateError,
  ErrorSeverity
} from '../types/errors';
import { trackErrorWithRecovery, trackError } from './analytics';
import { StorageState } from '../types';

export interface ErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  recoveryFn?: () => Promise<boolean>;
}

export interface ErrorResult {
  handled: boolean;
  recovered?: boolean;
  error: Error;
}

class BaseAssessmentError extends Error implements AssessmentError {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    severity: ErrorSeverity = 'medium',
    recoverable = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AssessmentError';
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = context;
  }
}

export class ValidationFailedError extends BaseAssessmentError implements ValidationError {
  field: string;
  constraint: string;

  constructor(field: string, constraint: string, message: string) {
    super(message, 'medium', true, { field, constraint });
    this.name = 'ValidationFailedError';
    this.field = field;
    this.constraint = constraint;
  }
}

export class StorageFailedError extends BaseAssessmentError implements StorageError {
  operation: 'read' | 'write' | 'delete';
  key?: string;

  constructor(operation: 'read' | 'write' | 'delete', key?: string) {
    super(
      `Storage operation ${operation} failed${key ? ` for key: ${key}` : ''}`,
      'high',
      operation === 'read',
      { operation, key }
    );
    this.name = 'StorageFailedError';
    this.operation = operation;
    this.key = key;
  }
}

export class NavigationFailedError extends BaseAssessmentError implements NavigationError {
  from: string;
  to: string;
  reason: string;

  constructor(from: string, to: string, reason: string) {
    super(
      `Navigation from ${from} to ${to} failed: ${reason}`,
      'medium',
      true,
      { from, to, reason }
    );
    this.name = 'NavigationFailedError';
    this.from = from;
    this.to = to;
    this.reason = reason;
  }
}

export class StateTransitionError extends BaseAssessmentError implements StateError {
  expectedState: string;
  actualState: string;
  stateKey: string;

  constructor(stateKey: string, expectedState: string, actualState: string) {
    super(
      `Invalid state transition for ${stateKey}: expected ${expectedState}, got ${actualState}`,
      'high',
      true,
      { stateKey, expectedState, actualState }
    );
    this.name = 'StateTransitionError';
    this.expectedState = expectedState;
    this.actualState = actualState;
    this.stateKey = stateKey;
  }
}

export const handleError = async (
  error: Error,
  options: ErrorHandlingOptions = {}
): Promise<ErrorResult> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    recoveryFn
  } = options;

  trackError(error);

  if (!recoveryFn) {
    return {
      handled: true,
      recovered: false,
      error
    };
  }

  let retries = 0;
  while (retries < maxRetries) {
    try {
      const recovered = await recoveryFn();
      if (recovered) {
        return {
          handled: true,
          recovered: true,
          error
        };
      }
    } catch (retryError) {
      trackError(retryError as Error);
    }

    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  return {
    handled: true,
    recovered: false,
    error
  };
};

export const isAssessmentError = (error: unknown): error is AssessmentError => {
  return error instanceof BaseAssessmentError;
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