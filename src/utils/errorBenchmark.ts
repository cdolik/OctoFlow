import { AssessmentError, ErrorContext } from '../types/errors';

interface BenchmarkResult {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  context?: Record<string, unknown>;
}

interface BenchmarkMetrics {
  min: number;
  max: number;
  avg: number;
  p95: number;
  sampleSize: number;
}

export class ErrorBenchmark {
  private static readonly METRICS_KEY = 'error_benchmarks';
  private results: Map<string, BenchmarkResult[]> = new Map();
  private static instance: ErrorBenchmark;

  private constructor() {
    this.loadResults();
  }

  static getInstance(): ErrorBenchmark {
    if (!ErrorBenchmark.instance) {
      ErrorBenchmark.instance = new ErrorBenchmark();
    }
    return ErrorBenchmark.instance;
  }

  async measureRecoveryTime(
    operation: string,
    fn: () => Promise<boolean>,
    context?: ErrorContext
  ): Promise<boolean> {
    const start = performance.now();
    let success = false;

    try {
      success = await fn();
    } finally {
      const duration = performance.now() - start;
      this.trackResult(operation, duration, success, context);
    }

    return success;
  }

  getMetrics(operation: string, timeWindow?: number): BenchmarkMetrics | null {
    const results = this.getFilteredResults(operation, timeWindow);
    if (!results.length) return null;

    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    const p95Index = Math.ceil(durations.length * 0.95) - 1;

    return {
      min: durations[0],
      max: durations[durations.length - 1],
      avg: sum / durations.length,
      p95: durations[p95Index],
      sampleSize: durations.length
    };
  }

  clearOldResults(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    for (const [operation, results] of this.results.entries()) {
      this.results.set(
        operation,
        results.filter(r => new Date(r.timestamp).getTime() > cutoff)
      );
    }
    this.saveResults();
  }

  private trackResult(
    operation: string,
    duration: number,
    success: boolean,
    context?: ErrorContext
  ): void {
    if (!this.results.has(operation)) {
      this.results.set(operation, []);
    }

    this.results.get(operation)!.push({
      operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      context: context as Record<string, unknown>
    });

    this.saveResults();
  }

  private getFilteredResults(operation: string, timeWindow?: number): BenchmarkResult[] {
    const results = this.results.get(operation) || [];
    if (!timeWindow) return results;

    const cutoff = Date.now() - timeWindow;
    return results.filter(r => new Date(r.timestamp).getTime() > cutoff);
  }

  private loadResults(): void {
    try {
      const stored = localStorage.getItem(ErrorBenchmark.METRICS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.results = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.error('Failed to load benchmark results:', e);
    }
  }

  private saveResults(): void {
    try {
      const data = Object.fromEntries(this.results);
      localStorage.setItem(ErrorBenchmark.METRICS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save benchmark results:', e);
    }
  }
}