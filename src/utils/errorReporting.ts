import { Stage } from '../types';

interface ErrorReport {
  errorType: string;
  message: string;
  componentStack?: string;
  timestamp: number;
  stage?: Stage;
  metadata?: Record<string, unknown>;
}

type ErrorCallback = (error: ErrorReport) => void;
const errorCallbacks: ErrorCallback[] = [];

export const ErrorReporter = {
  init() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleError);
  },

  cleanup() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleError);
    errorCallbacks.length = 0;
  },

  subscribe(callback: ErrorCallback) {
    errorCallbacks.push(callback);
    return () => {
      const index = errorCallbacks.indexOf(callback);
      if (index > -1) {
        errorCallbacks.splice(index, 1);
      }
    };
  },

  report(error: Error, componentStack?: string) {
    const report: ErrorReport = {
      errorType: error.name,
      message: error.message,
      componentStack,
      timestamp: Date.now()
    };

    errorCallbacks.forEach(callback => callback(report));
    return report;
  },

  getStoredErrors(): ErrorReport[] {
    try {
      const stored = sessionStorage.getItem('octoflow_errors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  clearErrors() {
    try {
      sessionStorage.removeItem('octoflow_errors');
    } catch {
      console.warn('Failed to clear error storage');
    }
  },

  handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason;
    ErrorReporter.report(error instanceof Error ? error : new Error(String(error)));
  },

  handleError(event: ErrorEvent) {
    if (event.error) {
      ErrorReporter.report(event.error);
    }
  },

  // Helper method to check if an error is recoverable
  isRecoverable(error: ErrorReport): boolean {
    const nonRecoverableErrors = [
      'QuotaExceededError',
      'SecurityError',
      'SyntaxError'
    ];

    if (nonRecoverableErrors.includes(error.errorType)) {
      return false;
    }

    // Storage-related errors are only recoverable if we have a stage
    if (error.message.includes('storage') && !error.stage) {
      return false;
    }

    return true;
  },

  // Attempt to recover from an error
  async attemptRecovery(error: ErrorReport): Promise<boolean> {
    if (!this.isRecoverable(error)) {
      return false;
    }

    try {
      // Store error for tracking
      const storedErrors = this.getStoredErrors();
      storedErrors.push(error);
      sessionStorage.setItem('octoflow_errors', JSON.stringify(storedErrors));

      // Different recovery strategies based on error type
      if (error.message.includes('assessment state')) {
        // Clear invalid state but preserve responses
        const responses = sessionStorage.getItem('octoflow_responses');
        sessionStorage.clear();
        if (responses) {
          sessionStorage.setItem('octoflow_responses', responses);
        }
        return true;
      }

      if (error.message.includes('validation')) {
        // For validation errors, we can usually recover by resetting to the last valid state
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
};