import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

interface ComponentMetric extends PerformanceMetric {
  renderCount: number;
  averageRenderTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentMetric> = new Map();
  private readonly MAX_METRICS = 1000;

  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  startMeasure(name: string): () => void {
    const startTime = Date.now();
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.metrics.push({
        name,
        startTime,
        endTime,
        duration
      });

      if (this.metrics.length > this.MAX_METRICS) {
        this.metrics.shift();
      }
    };
  }

  trackComponentRender(name: string, duration: number): void {
    const metric = this.componentMetrics.get(name) || {
      name,
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      renderCount: 0,
      averageRenderTime: 0
    };

    metric.renderCount++;
    metric.duration += duration;
    metric.averageRenderTime = metric.duration / metric.renderCount;
    this.componentMetrics.set(name, metric);
  }

  withTrackingEnabled<P extends object>(
    Component: React.ComponentType<P>,
    props: { componentName: string }
  ): React.FC<P> {
    return (componentProps: P) => {
      const start = Date.now();
      const result = React.createElement(Component, componentProps);
      this.trackComponentRender(props.componentName, Date.now() - start);
      return result;
    };
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
}

export const performance = new PerformanceMonitor();