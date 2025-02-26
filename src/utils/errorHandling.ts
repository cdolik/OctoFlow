import type { 
  ErrorSeverity,
  AssessmentError,
  NavigationError,
  StateError,
  ErrorHandlingOptions,
  ErrorContext
} from '../types/errors';
import type { BaseError, HandledError } from '../types/base';
import { trackError } from './analytics';
import type { StorageState } from '../types';

export class BaseAssessmentError extends Error implements BaseError {
  public severity: ErrorSeverity;
  public recoverable: boolean;
  public name: string;

  constructor(message: string, severity: ErrorSeverity = 'medium', recoverable = true) {
    super(message);
    this.name = 'BaseAssessmentError';
    this.severity = severity;
    this.recoverable = recoverable;
  }
}

export class StorageFailedError extends BaseAssessmentError {
  public operation: 'init' | 'read' | 'write' | 'delete';
  
  constructor(operation: 'init' | 'read' | 'write' | 'delete', message?: string) {
    super(message ?? `Storage operation "${operation}" failed`, 'high', true);
    this.name = 'StorageFailedError';
    this.operation = operation;
  }
}

export class ValidationFailedError extends BaseAssessmentError {
  constructor(message: string) {
    super(message, 'medium', true);
    this.name = 'ValidationFailedError';
  }
}

export class SessionExpiredError extends BaseAssessmentError {
  constructor() {
    super('Session has expired', 'medium', true);
    this.name = 'SessionExpiredError';
  }
}

export class NavigationFailedError extends BaseAssessmentError implements NavigationError {
  public from: string;
  public to: string;
  public reason: string;

  constructor(message: string, from: string, to: string, reason: string) {
    super(message, 'medium', true);
    this.name = 'NavigationFailedError';
    this.from = from;
    this.to = to;
    this.reason = reason;
  }
}

export class StateTransitionError extends BaseAssessmentError implements StateError {
  public expectedState: string;
  public actualState: string;
  public stateKey: string;

  constructor(
    message: string,
    stateKey: string,
    expectedState: string,
    actualState: string
  ) {
    super(message, 'high', true);
    this.name = 'StateTransitionError';
    this.stateKey = stateKey;
    this.expectedState = expectedState;
    this.actualState = actualState;
  }
}

export async function handleError(
  error: Error,
  context: ErrorContext,
  options: ErrorHandlingOptions = {}
): Promise<HandledError> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    recoveryFn
  } = options;

  trackError(error, context);

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
      const retryContext = {
        ...context,
        message: `Recovery attempt ${retries + 1} failed`,
        timestamp: new Date().toISOString(),
        metadata: {
          ...context.metadata,
          attemptNumber: retries + 1
        }
      };
      trackError(retryError as Error, retryContext);
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
}

export function isAssessmentError(error: unknown): error is AssessmentError {
  return error instanceof BaseAssessmentError;
}

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

export async function withErrorHandling<T>(
  operation: () => Promise<T>
): Promise<HandledError<T>> {
  try {
    const data = await operation();
    return { handled: true, recovered: true, error: null, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { handled: true, recovered: false, error: err };
  }
}

export function isRecoverableError(error: Error): boolean {
  if ('recoverable' in error) {
    return (error as BaseError).recoverable;
  }
  return !error.message.includes('critical') && 
         error.name !== 'SecurityError' &&
         error.name !== 'QuotaExceededError';
}

export function createErrorContext(
  component: string,
  action: string,
  message: string,
  metadata?: Record<string, unknown>
): ErrorContext {
  return {
    component,
    action,
    message,
    timestamp: new Date().toISOString(),
    metadata
  };
}

import { ErrorContext, AssessmentError, StorageError, ErrorSeverity } from '../types/errors';
import { Stage } from '../types';

export interface ErrorHandlerResult<T> {
  data: T | null;
  error: Error | null;
}

export function createErrorContext(
  component: string,
  action: string,
  details?: string,
  stage?: Stage
): ErrorContext {
  return {
    component,
    action,
    stage,
    timestamp: new Date().toISOString()
  };
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<ErrorHandlerResult<T>> {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

export function isStorageQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    // Firefox
    if (error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      return true;
    }
    // Chrome / Safari
    if (error.name === 'QuotaExceededError') {
      return true;
    }
    // Other browsers
    if (error.name === 'QUOTA_EXCEEDED_ERR') {
      return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('quota') && message.includes('exceed');
  }

  return false;
}

export function handleStorageError(error: unknown, context: ErrorContext): StorageError {
  if (isStorageQuotaExceededError(error)) {
    return new StorageError('Storage quota exceeded. Try clearing browser data.', {
      context,
      recoverable: true,
      severity: 'warning'
    });
  }

  if (error instanceof Error) {
    return new StorageError(`Storage operation failed: ${error.message}`, {
      context,
      recoverable: true,
      severity: 'warning'
    });
  }

  return new StorageError('Unknown storage error occurred', {
    context,
    recoverable: true,
    severity: 'warning'
  });
}

export function getErrorSeverityClass(severity: ErrorSeverity): string {
  switch (severity) {
    case 'critical':
      return 'error-critical';
    case 'error':
      return 'error-standard';
    case 'warning':
      return 'error-warning';
    case 'info':
      return 'error-info';
    default:
      return 'error-standard';
  }
}