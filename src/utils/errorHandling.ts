import { 
  AssessmentError,
  ValidationError,
  StorageError,
  NavigationError,
  StateError,
  ErrorSeverity
} from '../types/errors';
import { trackErrorWithRecovery } from './analytics';

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
  error: AssessmentError,
  recover?: () => Promise<boolean>
): Promise<boolean> => {
  // Track the error
  trackErrorWithRecovery(error, !!recover, false);

  // Attempt recovery if possible
  if (error.recoverable && recover) {
    try {
      const recovered = await recover();
      trackErrorWithRecovery(error, true, recovered);
      return recovered;
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      trackErrorWithRecovery(error, true, false);
      return false;
    }
  }

  return false;
};

export const isAssessmentError = (error: unknown): error is AssessmentError => {
  return error instanceof BaseAssessmentError;
};