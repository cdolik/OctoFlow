export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

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

export type ErrorHandler = (error: AssessmentError) => void;