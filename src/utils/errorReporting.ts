import { Stage } from '../types';

interface ErrorReport {
  error: Error;
  componentStack?: string;
  stage?: Stage;
  timestamp: string;
  userPreferences?: Record<string, unknown>;
  recoveryAttempts: number;
}

interface ErrorMetrics {
  totalErrors: number;
  recoverableErrors: number;
  criticalErrors: number;
  recoveryRate: number;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errors: ErrorReport[] = [];
  private readonly MAX_STORED_ERRORS = 50;

  private constructor() {
    // Initialize error storage
    this.loadStoredErrors();
    window.addEventListener('unload', () => this.persistErrors());
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

    // Keep only recent errors
    if (this.errors.length > this.MAX_STORED_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_STORED_ERRORS);
    }

    // Persist immediately for critical errors
    if (this.isCriticalError(error)) {
      await this.persistErrors();
      this.notifyDevTeam(errorReport);
    }
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
    const criticalErrors = this.errors.filter(
      report => this.isCriticalError(report.error)
    ).length;
    const recoveredErrors = this.errors.filter(
      report => report.recoveryAttempts > 0 && 
                report.error.name !== 'RecoveryFailedError'
    ).length;

    return {
      totalErrors,
      recoverableErrors: totalErrors - criticalErrors,
      criticalErrors,
      recoveryRate: totalErrors ? (recoveredErrors / totalErrors) * 100 : 0
    };
  }

  getRecentErrors(limit = 10): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  async clearErrors(): Promise<void> {
    this.errors = [];
    await this.persistErrors();
  }

  private isCriticalError(error: Error): boolean {
    return (
      error.name === 'SecurityError' ||
      error.name === 'QuotaExceededError' ||
      error.name === 'RecoveryFailedError' ||
      error instanceof TypeError ||
      error.message.includes('critical')
    );
  }

  private async persistErrors(): Promise<void> {
    try {
      localStorage.setItem(
        'errorReports',
        JSON.stringify(this.errors)
      );
    } catch (error) {
      console.error('Failed to persist error reports:', error);
    }
  }

  private loadStoredErrors(): void {
    try {
      const storedErrors = localStorage.getItem('errorReports');
      if (storedErrors) {
        this.errors = JSON.parse(storedErrors);
      }
    } catch (error) {
      console.error('Failed to load stored error reports:', error);
    }
  }

  private notifyDevTeam(errorReport: ErrorReport): void {
    // In production, this would send to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'Critical Error:',
        errorReport.error.message,
        '\nStack:', errorReport.error.stack,
        '\nComponent Stack:', errorReport.componentStack,
        '\nStage:', errorReport.stage,
        '\nTimestamp:', errorReport.timestamp
      );
    }
  }
}

export const errorReportingService = ErrorReportingService.getInstance();
export default errorReportingService;