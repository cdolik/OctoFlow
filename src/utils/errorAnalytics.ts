import { AssessmentError, ErrorContext, ErrorSeverity } from '../types/errors';

interface ErrorMetrics {
  timestamp: string;
  errorType: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  recovered: boolean;
  retryCount: number;
  stage?: string;
  component?: string;
}

class ErrorAnalytics {
  private static instance: ErrorAnalytics;
  private metrics: ErrorMetrics[] = [];
  private readonly MAX_STORED_METRICS = 100;

  private constructor() {
    this.loadStoredMetrics();
    window.addEventListener('unload', () => this.persistMetrics());
  }

  static getInstance(): ErrorAnalytics {
    if (!ErrorAnalytics.instance) {
      ErrorAnalytics.instance = new ErrorAnalytics();
    }
    return ErrorAnalytics.instance;
  }

  trackError(error: Error, context?: ErrorContext, recovered = false): void {
    const metrics: ErrorMetrics = {
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name,
      severity: error instanceof AssessmentError ? error.severity : 'high',
      recoverable: error instanceof AssessmentError ? error.recoverable : true,
      recovered,
      retryCount: 0,
      stage: context?.stage,
      component: context?.component
    };

    this.metrics.unshift(metrics);
    if (this.metrics.length > this.MAX_STORED_METRICS) {
      this.metrics = this.metrics.slice(0, this.MAX_STORED_METRICS);
    }

    this.persistMetrics();
  }

  updateRecoveryStatus(timestamp: string, recovered: boolean, retryCount: number): void {
    const metric = this.metrics.find(m => m.timestamp === timestamp);
    if (metric) {
      metric.recovered = recovered;
      metric.retryCount = retryCount;
      this.persistMetrics();
    }
  }

  getErrorRate(timeWindow: number = 3600000): number {
    const now = Date.now();
    const relevantMetrics = this.metrics.filter(
      m => now - new Date(m.timestamp).getTime() <= timeWindow
    );
    return relevantMetrics.length;
  }

  getRecoveryRate(timeWindow: number = 3600000): number {
    const now = Date.now();
    const relevantMetrics = this.metrics.filter(
      m => now - new Date(m.timestamp).getTime() <= timeWindow
    );
    
    if (relevantMetrics.length === 0) return 100;
    
    const recoveredCount = relevantMetrics.filter(m => m.recovered).length;
    return (recoveredCount / relevantMetrics.length) * 100;
  }

  getSeverityDistribution(timeWindow: number = 3600000): Record<ErrorSeverity, number> {
    const now = Date.now();
    const distribution: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
      error: 0
    };

    this.metrics
      .filter(m => now - new Date(m.timestamp).getTime() <= timeWindow)
      .forEach(m => {
        distribution[m.severity]++;
      });

    return distribution;
  }

  private persistMetrics(): void {
    try {
      localStorage.setItem('errorMetrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to persist error metrics:', error);
    }
  }

  private loadStoredMetrics(): void {
    try {
      const storedMetrics = localStorage.getItem('errorMetrics');
      if (storedMetrics) {
        this.metrics = JSON.parse(storedMetrics);
      }
    } catch (error) {
      console.error('Failed to load stored error metrics:', error);
    }
  }
}

export const errorAnalytics = ErrorAnalytics.getInstance();