import { Stage } from '../types';

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface ErrorContext {
  component: string;
  action: string;
  stage?: Stage;
  timestamp: string;
}

export class AssessmentError extends Error {
  context?: ErrorContext;
  recoverable: boolean = false;
  severity: ErrorSeverity = 'error';
  
  constructor(message: string, options?: {
    context?: ErrorContext;
    recoverable?: boolean;
    severity?: ErrorSeverity;
  }) {
    super(message);
    this.name = 'AssessmentError';
    
    if (options) {
      this.context = options.context;
      this.recoverable = options.recoverable ?? false;
      this.severity = options.severity ?? 'error';
    }
  }
}

export class StorageError extends AssessmentError {
  constructor(message: string, options?: {
    context?: ErrorContext;
    recoverable?: boolean;
    severity?: ErrorSeverity;
  }) {
    super(message, {
      recoverable: true,
      severity: 'warning',
      ...options
    });
    this.name = 'StorageError';
  }
}

export class NetworkError extends AssessmentError {
  constructor(message: string, options?: {
    context?: ErrorContext;
    recoverable?: boolean;
    severity?: ErrorSeverity;
  }) {
    super(message, {
      recoverable: true,
      severity: 'warning',
      ...options
    });
    this.name = 'NetworkError';
  }
}

export class ValidationFailedError extends AssessmentError {
  constructor(message: string, options?: {
    context?: ErrorContext;
    recoverable?: boolean;
    severity?: ErrorSeverity;
  }) {
    super(message, {
      recoverable: true,
      severity: 'warning',
      ...options
    });
    this.name = 'ValidationFailedError';
  }
}

export function isRecoverableError(error: unknown): boolean {
  return error instanceof AssessmentError && error.recoverable;
}

export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (error instanceof AssessmentError) {
    return error.severity;
  }
  return 'error';
}