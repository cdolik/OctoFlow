import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface ComponentMetric {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentMetric> = new Map();
  private readonly MAX_METRICS = 1000;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.metrics.push({
            name: `paint-${entry.name}`,
            startTime: entry.startTime,
            endTime: entry.startTime + entry.duration,
            duration: entry.duration
          });
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.error('Failed to initialize PerformanceObserver', error);
    }
  }

  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  startMeasure(name: string, metadata?: Record<string, any>): () => void {
    const startTime = Date.now();
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.metrics.push({
        name,
        startTime,
        endTime,
        duration,
        metadata
      });
      if (this.metrics.length > this.MAX_METRICS) {
        this.metrics.shift();
      }
    };
  }

  trackComponentRender(componentName: string, renderTime: number): void {
    const metric = this.componentMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: renderTime
    };
    metric.renderCount++;
    metric.totalRenderTime += renderTime;
    metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
    metric.lastRenderTime = renderTime;
    this.componentMetrics.set(componentName, metric);
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getComponentMetrics(): ComponentMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  getSlowComponents(threshold: number = 16): ComponentMetric[] {
    return this.getComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  clearMarks(): void {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
  }

  clearMeasures(): void {
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures();
    }
  }

  getEntriesByType(type: string): PerformanceEntry[] {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType(type);
    }
    return [];
  }
}

export const performance = new PerformanceMonitor();

// Add these missing functions that the tests are looking for
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>, 
  componentName: string
): React.FC<P> {
  return (props: P) => {
    const start = Date.now();
    const result = React.createElement(Component, props);
    performance.trackComponentRender(componentName, Date.now() - start);
    return result;
  };
}

export function getComponentMetrics<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const componentName = Component.displayName || Component.name || 'UnnamedComponent';
  return withPerformanceTracking(Component, componentName);
}