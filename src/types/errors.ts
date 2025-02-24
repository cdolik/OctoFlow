export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface AssessmentError extends Error {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: Record<string, unknown>;
}

export interface ValidationError extends AssessmentError {
  field: string;
  constraint: string;
}

export interface StorageError extends AssessmentError {
  operation: 'read' | 'write' | 'delete';
  key?: string;
}

export interface NavigationError extends AssessmentError {
  from: string;
  to: string;
  reason: string;
}

export interface StateError extends AssessmentError {
  expectedState: string;
  actualState: string;
  stateKey: string;
}

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

export interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}