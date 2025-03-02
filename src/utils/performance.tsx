import React, { useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface ComponentRenderMetric {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

/**
 * Performance monitoring singleton that tracks component renders and operation durations
 * with memory-efficient storage and proper cleanup
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentRenderMetric> = new Map();
  private readonly METRICS_LIMIT = 1000;
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
    
    // Auto cleanup old metrics periodically to prevent memory issues
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.metrics.length > this.METRICS_LIMIT / 2) {
          this.metrics = this.metrics.slice(-Math.floor(this.METRICS_LIMIT / 2));
        }
      }, 60000); // Clean up every minute if needed
    }
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
        endTime,
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
        const newTotalRenderTime = existing.totalRenderTime + renderTime;
        const newAverage = newTotalRenderTime / newCount;
        
        this.componentMetrics.set(componentName, {
          componentName,
          renderCount: newCount,
          totalRenderTime: newTotalRenderTime,
          averageRenderTime: newAverage,
          lastRenderTime: renderTime
        });
      } else {
        this.componentMetrics.set(componentName, {
          componentName,
          renderCount: 1,
          totalRenderTime: renderTime,
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
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

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
    return this.getComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

export default PerformanceMonitor;
