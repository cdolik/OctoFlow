interface PerformanceMetrics {
  operation: string;
  startTime: number;
  endTime: number;
  success: boolean;
  errorType?: string;
  recoveryAttempts?: number;
}

interface AggregatedMetrics {
  count: number;
  averageTime: number;
  p95Time: number;
  successRate: number;
}

class ErrorPerformanceMonitor {
  private static instance: ErrorPerformanceMonitor;
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly BUFFER_SIZE = 1000;
  private readonly METRICS_KEY = 'error_performance';

  private constructor() {
    this.loadMetrics();
    this.setupPerformanceObserver();
  }

  static getInstance(): ErrorPerformanceMonitor {
    if (!this.instance) {
      this.instance = new ErrorPerformanceMonitor();
    }
    return this.instance;
  }

  startOperation(operation: string): number {
    const startTime = performance.now();
    performance.mark(`${operation}-start`);
    return startTime;
  }

  endOperation(operation: string, startTime: number, success: boolean, metadata?: Record<string, unknown>): void {
    const endTime = performance.now();
    performance.mark(`${operation}-end`);
    
    performance.measure(
      operation,
      `${operation}-start`,
      `${operation}-end`
    );

    this.recordMetrics({
      operation,
      startTime,
      endTime,
      success,
      ...metadata
    });
  }

  getMetrics(operation: string, timeWindow?: number): AggregatedMetrics | null {
    const metrics = this.filterMetrics(operation, timeWindow);
    if (!metrics.length) return null;

    const times = metrics.map(m => m.endTime - m.startTime).sort((a, b) => a - b);
    const successCount = metrics.filter(m => m.success).length;

    return {
      count: metrics.length,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      p95Time: times[Math.floor(times.length * 0.95)],
      successRate: successCount / metrics.length
    };
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metricsBuffer.push(metrics);
    if (this.metricsBuffer.length > this.BUFFER_SIZE) {
      this.metricsBuffer.shift();
    }
    this.saveMetrics();
  }

  private filterMetrics(operation: string, timeWindow?: number): PerformanceMetrics[] {
    let metrics = this.metricsBuffer.filter(m => m.operation === operation);
    
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      metrics = metrics.filter(m => m.startTime >= cutoff);
    }

    return metrics;
  }

  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('error')) {
            console.debug(`Performance measurement for ${entry.name}:`, {
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(this.METRICS_KEY);
      if (stored) {
        this.metricsBuffer = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load performance metrics:', e);
    }
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem(this.METRICS_KEY, JSON.stringify(this.metricsBuffer));
    } catch (e) {
      console.error('Failed to save performance metrics:', e);
    }
  }
}