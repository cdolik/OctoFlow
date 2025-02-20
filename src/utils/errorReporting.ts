import { Stage } from '../components/withFlowValidation';

interface ErrorReport {
  timestamp: number;
  stage: Stage;
  errorType: string;
  message: string;
  componentStack?: string;
  userResponses?: Record<string, unknown>;
}

type ErrorCallback = (error: ErrorReport) => void;
const errorCallbacks: ErrorCallback[] = [];

export const ErrorReporter = {
  init() {
    // Initialize error listeners
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleError);
  },

  cleanup() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleError);
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
    const currentStage = sessionStorage.getItem('currentStage') as Stage || 'assessment';
    const userResponses = sessionStorage.getItem('assessment_responses');

    const errorReport: ErrorReport = {
      timestamp: Date.now(),
      stage: currentStage,
      errorType: error.name,
      message: error.message,
      componentStack,
      userResponses: userResponses ? JSON.parse(userResponses) : undefined
    };

    // Store error for recovery
    try {
      const errors = this.getStoredErrors();
      errors.push(errorReport);
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift();
      localStorage.setItem('octoflow_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }

    // Notify subscribers
    errorCallbacks.forEach(callback => {
      try {
        callback(errorReport);
      } catch (e) {
        console.error('Error in error callback:', e);
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport);
    }
  },

  getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('octoflow_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  clearErrors() {
    localStorage.removeItem('octoflow_errors');
  },

  handleUnhandledRejection(event: PromiseRejectionEvent) {
    ErrorReporter.report(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    );
  },

  handleError(event: ErrorEvent) {
    ErrorReporter.report(
      event.error instanceof Error ? event.error : new Error(event.message)
    );
  },

  // Helper method to check if an error is recoverable
  isRecoverable(error: ErrorReport): boolean {
    const nonRecoverableErrors = [
      'SyntaxError',
      'ReferenceError',
      'TypeError'
    ];
    return !nonRecoverableErrors.includes(error.errorType);
  },

  // Attempt to recover from an error
  async attemptRecovery(error: ErrorReport): Promise<boolean> {
    if (!this.isRecoverable(error)) {
      return false;
    }

    try {
      // If we have user responses, try to restore them
      if (error.userResponses) {
        sessionStorage.setItem('assessment_responses', JSON.stringify(error.userResponses));
      }

      // Restore stage if needed
      if (error.stage) {
        sessionStorage.setItem('currentStage', error.stage);
      }

      return true;
    } catch (e) {
      console.error('Recovery attempt failed:', e);
      return false;
    }
  }
};