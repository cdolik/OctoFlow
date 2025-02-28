export type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: string;
  stage?: Stage;
  metadata?: Record<string, unknown>;
}

export interface AssessmentError extends Error {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: ErrorContext;
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
): AssessmentError => {
  const error = new Error(message) as AssessmentError;
  error.severity = severity;
  error.recoverable = recoverable;
  error.context = context;
  return error;
};

// Error type guards
export const isAssessmentError = (error: unknown): error is AssessmentError => {
  return error instanceof Error && 'severity' in error && 'recoverable' in error;
};