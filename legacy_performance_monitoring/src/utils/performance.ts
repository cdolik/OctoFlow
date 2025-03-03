import React, { useEffect, useRef } from 'react';

/**
 * Performance Monitoring System
 * 
 * A comprehensive system for monitoring React component performance in production.
 * Features include:
 * - Component render time tracking
 * - Memory usage monitoring
 * - Interaction tracking
 * - Configurable sampling rate
 * - Automatic cleanup
 * 
 * Usage:
 * ```tsx
 * // With HOC
 * const TrackedComponent = withPerformanceTracking(MyComponent, 'MyComponent');
 * 
 * // With Hook
 * function MyComponent() {
 *   usePerformanceTracking('MyComponent');
 *   return <div>Content</div>;
 * }
 * ```
 * 
 * Configuration:
 * ```tsx
 * PerformanceMonitor.getInstance({
 *   slowThreshold: 16, // ms
 *   sampleRate: 0.1,   // 10% sampling
 *   enableMemoryTracking: true,
 *   enableInteractionTracking: true,
 *   maxMetrics: 1000
 * });
 * ```
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

/**
 * Represents performance metrics for a single component instance
 */
interface ComponentMetric {
  /** Name of the component being tracked */
  componentName: string;
  /** Number of times the component has rendered */
  renderCount: number;
  /** Total time spent rendering in milliseconds */
  totalRenderTime: number;
  /** Average render time in milliseconds */
  averageRenderTime: number;
  /** Time taken by the most recent render in milliseconds */
  lastRenderTime: number;
  /** Estimated heap memory usage in bytes (if enabled) */
  memoryUsage?: number;
  /** Number of user interactions with the component (if enabled) */
  interactionCount?: number;
}

interface PerformanceConfig {
  enableMemoryTracking?: boolean;
  enableInteractionTracking?: boolean;
  sampleRate?: number;
  maxMetrics?: number;
  slowThreshold?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentMetric> = new Map();
  private readonly config: Required<PerformanceConfig>;
  private observers: PerformanceObserver[] = [];
  private static instance: PerformanceMonitor;

  private constructor(config: PerformanceConfig = {}) {
    this.config = {
      enableMemoryTracking: config.enableMemoryTracking ?? true,
      enableInteractionTracking: config.enableInteractionTracking ?? true,
      sampleRate: config.sampleRate ?? 1.0,
      maxMetrics: config.maxMetrics ?? 1000,
      slowThreshold: config.slowThreshold ?? 16
    };
    this.initializeObservers();
  }

  static getInstance(config?: PerformanceConfig): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (Math.random() <= this.config.sampleRate) {
            this.metrics.push({
              name: `paint-${entry.name}`,
              startTime: entry.startTime,
              endTime: entry.startTime + entry.duration,
              duration: entry.duration
            });
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Long task observer
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.metrics.push({
            name: 'long-task',
            startTime: entry.startTime,
            endTime: entry.startTime + entry.duration,
            duration: entry.duration,
            metadata: { attribution: (entry as any).attribution }
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

    } catch (error) {
      console.error('Failed to initialize PerformanceObserver', error);
    }
  }

  private trackMemoryUsage(): number | undefined {
    if (!this.config.enableMemoryTracking) return undefined;
    
    try {
      const memory = (performance as any).memory;
      return memory ? memory.usedJSHeapSize : undefined;
    } catch {
      return undefined;
    }
  }

  trackComponentRender(componentName: string, renderTime: number): void {
    if (Math.random() > this.config.sampleRate) return;

    const metric = this.componentMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: renderTime,
      interactionCount: 0,
      memoryUsage: this.trackMemoryUsage()
    };

    metric.renderCount++;
    metric.totalRenderTime += renderTime;
    metric.averageRenderTime = metric.totalRenderTime / metric.renderCount;
    metric.lastRenderTime = renderTime;
    metric.memoryUsage = this.trackMemoryUsage();

    this.componentMetrics.set(componentName, metric);

    // Trim metrics if needed
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  trackInteraction(componentName: string): void {
    if (!this.config.enableInteractionTracking) return;

    const metric = this.componentMetrics.get(componentName);
    if (metric) {
      metric.interactionCount = (metric.interactionCount || 0) + 1;
      this.componentMetrics.set(componentName, metric);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getComponentMetrics(): ComponentMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  getSlowComponents(): ComponentMetric[] {
    return this.getComponentMetrics()
      .filter(metric => metric.averageRenderTime > this.config.slowThreshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

export { PerformanceMonitor };
export const performance = PerformanceMonitor.getInstance();

/**
 * Higher-Order Component that wraps a component with performance tracking
 * @param Component The component to track
 * @param componentName Optional name for the component (defaults to Component.displayName)
 * @returns A wrapped component with performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>, 
  componentName?: string
): React.NamedExoticComponent<P> {
  const displayName = componentName || Component.displayName || Component.name || 'UnnamedComponent';
  
  const WrappedComponent = (props: P) => {
    const renderStartTime = useRef<number>();
    
    useEffect(() => {
      const interactionHandler = () => {
        performance.trackInteraction(displayName);
      };

      const element = document.querySelector(`[data-component="${displayName}"]`);
      if (element) {
        element.addEventListener('click', interactionHandler);
        element.addEventListener('keydown', interactionHandler);
      }

      return () => {
        if (element) {
          element.removeEventListener('click', interactionHandler);
          element.removeEventListener('keydown', interactionHandler);
        }
      };
    }, []);

    renderStartTime.current = window.performance.now();
    
    useEffect(() => {
      if (renderStartTime.current) {
        performance.trackComponentRender(displayName, window.performance.now() - renderStartTime.current);
      }
    });

    return React.createElement(Component, {
      ...props,
      'data-component': displayName
    } as P);
  };

  WrappedComponent.displayName = `WithPerformanceTracking(${displayName})`;
  return React.memo(WrappedComponent);
}

export function usePerformanceTracking(componentName: string): void {
  const renderStartTime = useRef<number>(window.performance.now());

  useEffect(() => {
    const endTime = window.performance.now();
    performance.trackComponentRender(componentName, endTime - renderStartTime.current);
    // Update start time for next render
    renderStartTime.current = endTime;
  });
}