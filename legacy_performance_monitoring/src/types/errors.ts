export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface ErrorContext {
  component: string;
  message: string;
  timestamp: string;
}

export interface BaseError extends Error {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: ErrorContext;
}

export class AssessmentError extends Error implements BaseError {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: ErrorContext;

  constructor(
    message: string,
    severity: ErrorSeverity = 'medium',
    recoverable = true,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AssessmentError';
    this.severity = severity;
    this.recoverable = recoverable;
    this.context = context;
  }
}

export const createErrorContext = (
  component: string,
  message: string
): ErrorContext => ({
  component,
  message,
  timestamp: new Date().toISOString()
});

export const isAssessmentError = (error: unknown): error is AssessmentError => {
  return error instanceof AssessmentError;
};