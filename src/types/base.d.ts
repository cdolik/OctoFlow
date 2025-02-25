import type { ErrorSeverity } from './errors';

export interface BaseError extends Error {
  severity: ErrorSeverity;
  recoverable: boolean;
  name: string;
}

export interface HandledError<T = unknown> {
  handled: boolean;
  recovered: boolean;
  error: Error | null;
  data?: T;
}