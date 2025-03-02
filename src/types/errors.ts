export type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'welcome' | 'assessment' | 'results' | 'summary';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: string;
  stage?: Stage;
  metadata?: Record<string, unknown>;
}

export interface IAssessmentError extends Error {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: ErrorContext;
}

// Actual AssessmentError class implementation
export class AssessmentError extends Error implements IAssessmentError {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: ErrorContext;

  constructor(
    message: string, 
    options: { 
      severity?: ErrorSeverity, 
      recoverable?: boolean, 
      context?: ErrorContext 
    } = {}
  ) {
    super(message);
    this.name = 'AssessmentError';
    this.severity = options.severity || 'medium';
    this.recoverable = options.recoverable !== undefined ? options.recoverable : true;
    this.context = options.context;
  }
}

export interface ErrorReport {
  id: string;
  error: Error;
  context?: ErrorContext;
  recoveryAttempts: number;
  timestamp: string;
  resolved: boolean;
}

export interface ErrorState {
  activeErrors: ErrorReport[];
  isHandlingError: boolean;
  currentAttempt: number;
  maxAttempts: number;
}

// Error factories
export const createErrorContext = (
  component: string,
  action: string,
  stage?: Stage,
  metadata?: Record<string, unknown>
): ErrorContext => ({
  component,
  action,
  timestamp: new Date().toISOString(),
  stage,
  metadata
});

export const createAssessmentError = (
  message: string,
  severity: ErrorSeverity = 'medium',
  recoverable = true,
  context?: ErrorContext
): IAssessmentError => {
  return new AssessmentError(message, { severity, recoverable, context });
};

// Error type guards
export const isAssessmentError = (error: unknown): error is IAssessmentError => {
  return error instanceof Error && 'severity' in error && 'recoverable' in error;
};