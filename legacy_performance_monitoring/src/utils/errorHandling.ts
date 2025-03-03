import { ErrorSeverity, ErrorContext, BaseError, AssessmentError } from '../types/errors';

export class StorageError extends AssessmentError {
  constructor(message: string, severity: ErrorSeverity = 'medium', recoverable = true) {
    super(message, severity, recoverable);
    this.name = 'StorageError';
  }
}

export class ValidationError extends AssessmentError {
  constructor(message: string, recoverable = true) {
    super(message, 'medium', recoverable);
    this.name = 'ValidationError';
  }
}

export async function handleError<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AssessmentError) {
      throw error;
    }
    throw new AssessmentError(
      error instanceof Error ? error.message : String(error),
      'medium',
      true,
      context
    );
  }
}

export function createErrorContext(
  component: string,
  message: string
): ErrorContext {
  return {
    component,
    message,
    timestamp: new Date().toISOString()
  };
}

export function getErrorSeverityClass(severity: ErrorSeverity): string {
  switch (severity) {
    case 'high':
      return 'error-critical';
    case 'medium':
      return 'error-standard';
    case 'low':
      return 'error-warning';
    default:
      return 'error-standard';
  }
}
