<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
=======
import React from 'react';
>>>>>>> 73079e2 (Refactor tests, enhance deployment script, and update ESLint configuration)

interface PerformanceMetric {
  name: string;
  startTime: number;
<<<<<<< HEAD
  duration: number;
  metadata?: Record<string, unknown>;
}

interface ComponentRenderMetric {
  componentName: string;
  renderCount: number;
=======
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface ComponentMetric {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
>>>>>>> 73079e2 (Refactor tests, enhance deployment script, and update ESLint configuration)
  averageRenderTime: number;
  lastRenderTime: number;
}

<<<<<<< HEAD
/**
 * Performance monitoring singleton that tracks component renders and operation durations
 * with memory-efficient storage and proper cleanup
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentRenderMetric> = new Map();
  private readonly METRICS_LIMIT = 1000;
  private isObserverSetup = false;

  private constructor() {
    this.setupPerformanceObserver();
    this.setupInteractionMonitoring();
    
    // Auto cleanup old metrics periodically to prevent memory issues
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.metrics.length > this.METRICS_LIMIT / 2) {
          this.metrics = this.metrics.slice(-Math.floor(this.METRICS_LIMIT / 2));
        }
      }, 60000); // Clean up every minute if needed
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation and return a function to end and record it
   * @param name Name of the operation to track
   * @param metadata Optional metadata to associate with this operation
   * @returns Function to call when operation completes
   */
  startMeasure(name: string, metadata?: Record<string, unknown>): () => void {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    return () => {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const duration = endTime - startTime;
      this.recordMetric({ 
        name, 
        startTime, 
        duration, 
        metadata 
      });
    };
  }

  /**
   * Record a component render time
   * @param componentName The name of the component
   * @param renderTime Time taken to render in ms
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    try {
      const existing = this.componentMetrics.get(componentName);
      
      if (existing) {
        const newCount = existing.renderCount + 1;
        // Calculate moving average to prevent floating point precision errors
        const newAverage = existing.averageRenderTime + 
          (renderTime - existing.averageRenderTime) / newCount;
        
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
    } catch (error) {
      console.error('Error tracking component render:', error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    try {
      this.metrics.push(metric);
      
      // Keep metrics array within size limit to prevent memory issues
      if (this.metrics.length > this.METRICS_LIMIT) {
        this.metrics = this.metrics.slice(-this.METRICS_LIMIT);
      }
      
      // Log slow operations as warnings
      if (metric.duration > 100) {
        console.warn(
          `Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`,
          metric.metadata
        );
      }
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }

  /**
   * Get all recorded performance metrics
   */
=======
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

>>>>>>> 73079e2 (Refactor tests, enhance deployment script, and update ESLint configuration)
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

<<<<<<< HEAD
  /**
   * Get metrics for all tracked components
   */
  getComponentMetrics(): ComponentRenderMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get components that render slower than the specified threshold
   * @param threshold Time threshold in ms (default: 16ms - 60fps budget)
   */
  getSlowComponents(threshold = 16): ComponentRenderMetric[] {
=======
  getComponentMetrics(): ComponentMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  getSlowComponents(threshold: number = 16): ComponentMetric[] {
>>>>>>> 73079e2 (Refactor tests, enhance deployment script, and update ESLint configuration)
    return this.getComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

<<<<<<< HEAD
  /**
   * Set up performance observer for long tasks if supported
   */
  private setupPerformanceObserver(): void {
    if (this.isObserverSetup) return;

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'longtask') {
              this.recordMetric({
                name: `LongTask-${entry.name || 'unknown'}`,
                startTime: entry.startTime,
                duration: entry.duration,
                metadata: {
                  attribution: entry.attribution,
                  entryType: entry.entryType
                }
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        this.isObserverSetup = true;
      } catch (error) {
        console.error('PerformanceObserver setup failed:', error);
      }
    }
  }

  /**
   * Set up monitoring for user interactions if supported
   */
  private setupInteractionMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
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
        
        // Try to observe interaction metrics if supported
        try {
          observer.observe({ entryTypes: ['event', 'measure'] });
        } catch (e) {
          // Fallback to just measures if event observation not supported
          try {
            observer.observe({ entryTypes: ['measure'] });
          } catch (error) {
            console.error('Interaction monitoring setup failed:', error);
          }
        }
      } catch (error) {
        console.error('Interaction monitoring setup failed:', error);
      }
    }
  }

  /**
   * Clear all metrics data
   */
  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

/**
 * HOC for tracking component render performance
 * @param WrappedComponent The component to track
 * @param componentName Optional name for the component (defaults to component's displayName or name)
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName = WrappedComponent.displayName || WrappedComponent.name || 'UnnamedComponent'
): React.ComponentType<P> {
  const TrackedComponent = (props: P) => {
    const startTime = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());
    const renderCount = useRef(0);
    
    // Measure initial render
    useEffect(() => {
      const renderTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime.current;
      performance.trackComponentRender(componentName, renderTime);
      renderCount.current++;
      
      // Setup for measuring updates
      return () => {
        // Only measure unmount if not first render
        if (renderCount.current > 0) {
          const unmountTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime.current;
          performance.recordMetric({
            name: `${componentName}-unmount`,
            startTime: startTime.current,
            duration: unmountTime
          });
        }
      };
    }, []);
    
    // Reset start time before each render to measure update time
    startTime.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    return <WrappedComponent {...props} />;
  };
  
  TrackedComponent.displayName = `WithPerformanceTracking(${componentName})`;
  
  return TrackedComponent;
}

// Create and export singleton instance
export const performance = PerformanceMonitor.getInstance();
=======
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
>>>>>>> 73079e2 (Refactor tests, enhance deployment script, and update ESLint configuration)
