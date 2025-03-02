import { Stage } from '../types';
import { AssessmentError, ErrorContext } from '../types/errors';

interface ErrorReport {
  error: Error;
  componentStack?: string;
  stage?: Stage;
  timestamp: string;
  userPreferences?: Record<string, unknown>;
  recoveryAttempts: number;
  resolved?: boolean;
}

interface ErrorMetrics {
  totalErrors: number;
  recoverableErrors: number;
  highSeverityErrors: number;
  recoveryRate: number;
}

export function trackError(error: Error, metadata?: Record<string, any>): void {
  // Simple implementation for MVP
  console.error('Error tracked:', error, metadata);
}

export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errors: ErrorReport[] = [];
  private readonly MAX_STORED_ERRORS = 50;
  private readonly STORAGE_KEY = 'errorReports';

  private constructor() {
    this.loadStoredErrors();
    window.addEventListener('unload', () => this.persistErrors());
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  async reportError(
    error: Error,
    componentStack?: string,
    stage?: Stage,
    userPreferences?: Record<string, unknown>
  ): Promise<void> {
    const errorReport: ErrorReport = {
      error,
      componentStack,
      stage,
      timestamp: new Date().toISOString(),
      userPreferences,
      recoveryAttempts: 0
    };

    this.errors.unshift(errorReport);

    if (this.errors.length > this.MAX_STORED_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_STORED_ERRORS);
    }

    if (this.isHighSeverityError(error)) {
      await this.persistErrors();
      this.notifyDevTeam(errorReport);
    }

    trackError(error, {
      stage,
      componentStack,
      isHighSeverity: this.isHighSeverityError(error)
    });
  }

  getError(timestamp: string): ErrorReport | undefined {
    return this.errors.find(report => report.timestamp === timestamp);
  }

  getErrorsForStage(stage: Stage): ErrorReport[] {
    return this.errors.filter(report => report.stage === stage);
  }

  async updateRecoveryAttempts(error: Error): Promise<void> {
    const errorReport = this.errors.find(
      report => report.error.message === error.message
    );

    if (errorReport) {
      errorReport.recoveryAttempts++;
      await this.persistErrors();
    }
  }

  getErrorMetrics(): ErrorMetrics {
    const totalErrors = this.errors.length;
    const highSeverityErrors = this.errors.filter(
      report => this.isHighSeverityError(report.error)
    ).length;
    const recoveredErrors = this.errors.filter(
      report => report.recoveryAttempts > 0 && report.resolved
    ).length;

    return {
      totalErrors,
      recoverableErrors: totalErrors - highSeverityErrors,
      highSeverityErrors,
      recoveryRate: totalErrors ? (recoveredErrors / totalErrors) * 100 : 0
    };
  }

  async clearErrors(): Promise<void> {
    this.errors = [];
    await this.persistErrors();
  }

  private isHighSeverityError(error: Error): boolean {
    return (
      error.name === 'SecurityError' ||
      error.name === 'QuotaExceededError' ||
      error.name === 'RecoveryFailedError' ||
      error instanceof TypeError ||
      (error instanceof AssessmentError && error.severity === 'high')
    );
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.reportError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    );
  }

  private async persistErrors(): Promise<void> {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.errors.map(report => ({
          ...report,
          error: {
            name: report.error.name,
            message: report.error.message,
            stack: report.error.stack
          }
        })))
      );
    } catch (error) {
      console.error('Failed to persist error reports:', error);
    }
  }

  private loadStoredErrors(): void {
    try {
      const storedErrors = localStorage.getItem(this.STORAGE_KEY);
      if (storedErrors) {
        const parsed = JSON.parse(storedErrors);
        this.errors = parsed.map((report: Omit<ErrorReport, 'error'> & { error: { name: string; message: string; stack?: string } }) => ({
          ...report,
          error: Object.assign(new Error(report.error.message), report.error)
        }));
      }
    } catch (error) {
      console.error('Failed to load stored error reports:', error);
    }
  }

  private notifyDevTeam(errorReport: ErrorReport): void {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'High Severity Error:',
        errorReport.error.message,
        '\nStack:', errorReport.error.stack,
        '\nComponent Stack:', errorReport.componentStack,
        '\nStage:', errorReport.stage,
        '\nTimestamp:', errorReport.timestamp
      );
    }
  }
}

export const errorReporter = ErrorReportingService.getInstance();
