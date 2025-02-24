interface PerformanceMetric {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface ComponentRenderMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentRenderMetric> = new Map();
  private readonly METRICS_LIMIT = 1000;

  private constructor() {
    this.setupPerformanceObserver();
    this.setupInteractionMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string, metadata?: Record<string, unknown>): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({ name, startTime, duration, metadata });
    };
  }

  trackComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      const newCount = existing.renderCount + 1;
      const newAverage = (
        (existing.averageRenderTime * existing.renderCount) + renderTime
      ) / newCount;
      
      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: newCount,
        averageRenderTime: newAverage,
        lastRenderTime: renderTime
      });
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime
      });
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getComponentMetrics(): ComponentRenderMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  getSlowComponents(threshold = 16): ComponentRenderMetric[] {
    return this.getComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.METRICS_LIMIT) {
      this.metrics = this.metrics.slice(-this.METRICS_LIMIT);
    }

    if (metric.duration > 100) {
      console.warn(
        `Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`,
        metric.metadata
      );
    }
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            console.warn(
              `Long task detected: ${entry.duration}ms`,
              entry
            );
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  private setupInteractionMonitoring(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.interactionId) {
            this.recordMetric({
              name: `Interaction-${entry.name}`,
              startTime: entry.startTime,
              duration: entry.duration,
              metadata: {
                interactionId: entry.interactionId,
                target: entry.target
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['event', 'measure'] });
    }
  }

  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

// HOC for tracking component render performance
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName = WrappedComponent.displayName || WrappedComponent.name
): React.ComponentType<P> {
  return function PerformanceTrackedComponent(props: P) {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      PerformanceMonitor.getInstance().trackComponentRender(
        componentName,
        renderTime
      );
    });

    return <WrappedComponent {...props} />;
  };
}

export const performance = PerformanceMonitor.getInstance();