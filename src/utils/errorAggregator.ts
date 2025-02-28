import { AssessmentError, ErrorContext } from '../types/errors';

interface ErrorMetrics {
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  recoveryAttempts: number;
  recoverySuccess: number;
}

interface AggregatedError {
  signature: string;
  message: string;
  severity: string;
  metrics: ErrorMetrics;
  contexts: ErrorContext[];
}

export class ErrorAggregator {
  private static readonly STORAGE_KEY = 'error_aggregates';
  private static readonly MAX_CONTEXTS = 10;
  private aggregates: Map<string, AggregatedError> = new Map();

  constructor() {
    this.loadAggregates();
  }

  track(error: AssessmentError, context?: ErrorContext): void {
    const signature = this.getErrorSignature(error);
    const now = new Date().toISOString();
    
    if (!this.aggregates.has(signature)) {
      this.aggregates.set(signature, {
        signature,
        message: error.message,
        severity: error.severity,
        metrics: {
          count: 0,
          firstOccurrence: now,
          lastOccurrence: now,
          recoveryAttempts: 0,
          recoverySuccess: 0
        },
        contexts: []
      });
    }

    const aggregate = this.aggregates.get(signature)!;
    aggregate.metrics.count++;
    aggregate.metrics.lastOccurrence = now;
    
    if (context) {
      aggregate.contexts = [
        context,
        ...aggregate.contexts.slice(0, this.MAX_CONTEXTS - 1)
      ];
    }

    this.saveAggregates();
  }

  updateRecoveryStatus(error: AssessmentError, succeeded: boolean): void {
    const signature = this.getErrorSignature(error);
    const aggregate = this.aggregates.get(signature);
    
    if (aggregate) {
      aggregate.metrics.recoveryAttempts++;
      if (succeeded) {
        aggregate.metrics.recoverySuccess++;
      }
      this.saveAggregates();
    }
  }

  getAggregates(): AggregatedError[] {
    return Array.from(this.aggregates.values());
  }

  private getErrorSignature(error: AssessmentError): string {
    return `${error.name}:${error.severity}:${error.message}`;
  }

  private loadAggregates(): void {
    try {
      const stored = localStorage.getItem(ErrorAggregator.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.aggregates = new Map(Object.entries(data));
      }
    } catch (e) {
      console.error('Failed to load error aggregates:', e);
    }
  }

  private saveAggregates(): void {
    try {
      const data = Object.fromEntries(this.aggregates);
      localStorage.setItem(ErrorAggregator.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save error aggregates:', e);
    }
  }
}