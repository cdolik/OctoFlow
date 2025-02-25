import type { BaseError } from './base';

export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface ErrorContext {
  component: string;
  action: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AssessmentError extends Error {
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: ErrorContext;
}

export interface ValidationError extends Error {
  field: string;
  value: unknown;
  constraints: Record<string, string>;
}

export interface NetworkError extends Error {
  status?: number;
  retryAfter?: number;
  endpoint?: string;
}

export interface StorageError extends Error {
  storageType: 'local' | 'session' | 'indexedDB';
  operation: 'read' | 'write' | 'delete' | 'clear';
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

export interface HandledError<T = unknown> {
  handled: boolean;
  recovered: boolean;
  error: Error | null;
  data?: T;
}

export type ErrorHandler = (error: AssessmentError) => void;
export type ErrorCallback = (error: AssessmentError, context?: ErrorContext) => void;