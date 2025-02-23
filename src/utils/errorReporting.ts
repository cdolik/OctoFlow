import { Stage, AssessmentState } from '../types';
import { trackError } from './analytics';

interface ErrorContext {
  stage?: Stage;
  responses?: Record<string, number>;
  metadata?: Record<string, any>;
  timestamp: number;
}

interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  recoveryAttempts: number;
  resolved: boolean;
  timestamp: number;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private errors: Map<string, ErrorReport> = new Map();
  private errorCallbacks: Set<(report: ErrorReport) => void> = new Set();

  private constructor() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.reportError(error);
  };

  reportError(error: Error, context: Partial<ErrorContext> = {}): string {
    const errorId = this.generateErrorId();
    const report: ErrorReport = {
      id: errorId,
      error,
      context: {
        timestamp: Date.now(),
        ...context
      },
      recoveryAttempts: 0,
      resolved: false,
      timestamp: Date.now()
    };

    this.errors.set(errorId, report);
    this.notifyErrorCallbacks(report);

    trackError('error_reported', {
      errorId,
      message: error.message,
      stage: context.stage,
      timestamp: report.timestamp
    });

    return errorId;
  }

  private notifyErrorCallbacks(report: ErrorReport): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }

  updateErrorStatus(errorId: string, updates: Partial<ErrorReport>): void {
    const report = this.errors.get(errorId);
    if (!report) return;

    const updatedReport = {
      ...report,
      ...updates,
      timestamp: Date.now()
    };

    this.errors.set(errorId, updatedReport);
    this.notifyErrorCallbacks(updatedReport);
  }

  markErrorResolved(errorId: string): void {
    this.updateErrorStatus(errorId, { resolved: true });
  }

  incrementRecoveryAttempt(errorId: string): void {
    const report = this.errors.get(errorId);
    if (!report) return;

    this.updateErrorStatus(errorId, {
      recoveryAttempts: report.recoveryAttempts + 1
    });
  }

  getError(errorId: string): ErrorReport | undefined {
    return this.errors.get(errorId);
  }

  getActiveErrors(): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(report => !report.resolved)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  subscribeToErrors(callback: (report: ErrorReport) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  clearResolvedErrors(): void {
    for (const [id, report] of this.errors.entries()) {
      if (report.resolved) {
        this.errors.delete(id);
      }
    }
  }

  getErrorsForStage(stage: Stage): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(report => report.context.stage === stage)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  dispose(): void {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    this.errors.clear();
    this.errorCallbacks.clear();
  }
}

export const errorReporter = ErrorReporter.getInstance();
export default errorReporter;