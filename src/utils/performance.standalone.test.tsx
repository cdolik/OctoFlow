// filepath: /Users/coreydolik/Desktop/OctoFlow/src/utils/performance.standalone.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a lightweight performance monitoring utility for testing
class PerformanceMonitor {
  private metrics: Array<{name: string; startTime: number; duration: number; metadata?: any}> = [];
  private componentMetrics: Map<string, {componentName: string; renderCount: number; averageRenderTime: number; lastRenderTime: number}> = new Map();
  private readonly METRICS_LIMIT = 1000;

  startMeasure(name: string, metadata?: Record<string, unknown>) {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.metrics.push({name, startTime, duration, metadata});
      if (this.metrics.length > this.METRICS_LIMIT) {
        this.metrics.shift();
      }
    };
  }

  trackComponentRender(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      const newCount = existing.renderCount + 1;
      const newAverage = ((existing.averageRenderTime * existing.renderCount) + renderTime) / newCount;
      
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

  getMetrics() {
    return [...this.metrics];
  }

  getComponentMetrics() {
    return Array.from(this.componentMetrics.values());
  }

  getSlowComponents(threshold = 16) {
    return this.getComponentMetrics()
      .filter(metric => metric.averageRenderTime > threshold)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  clearMetrics() {
    this.metrics = [];
    this.componentMetrics.clear();
  }
}

const performance = new PerformanceMonitor();

function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName = WrappedComponent.displayName || WrappedComponent.name || 'UnnamedComponent'
) {
  const TrackedComponent = (props: P) => {
    const startTime = Date.now();
    
    React.useEffect(() => {
      const renderTime = Date.now() - startTime;
      performance.trackComponentRender(componentName, renderTime);
    }, []);
    
    return <WrappedComponent {...props} />;
  };
  
  TrackedComponent.displayName = `WithPerformanceTracking(${componentName})`;
  
  return TrackedComponent;
}

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performance.clearMetrics();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tracks operation duration', () => {
    const endMeasure = performance.startMeasure('test-operation');
    jest.advanceTimersByTime(100);
    endMeasure();

    const metrics = performance.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test-operation');
    expect(metrics[0].duration).toBeGreaterThan(0);
  });

  it('limits stored metrics', () => {
    for (let i = 0; i < 1100; i++) {
      const endMeasure = performance.startMeasure(`operation-${i}`);
      endMeasure();
    }

    const metrics = performance.getMetrics();
    expect(metrics).toHaveLength(1000);
    expect(metrics[metrics.length - 1].name).toBe('operation-1099');
  });

  it('tracks component render times', () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    const TrackingComponent = withPerformanceTracking(TestComponent, 'TestComponent');
    
    render(<TrackingComponent />);
    
    // Allow effects to run to complete tracking
    jest.runAllTimers();
    
    const componentMetrics = performance.getComponentMetrics();
    expect(componentMetrics).toHaveLength(1);
    expect(componentMetrics[0].componentName).toBe('TestComponent');
    expect(componentMetrics[0].renderCount).toBe(1);
  });

  it('calculates average render times correctly', () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    const WrappedComponent = withPerformanceTracking(TestComponent, 'TestComponent');

    // Simulate multiple renders
    for (let i = 0; i < 3; i++) {
      render(<WrappedComponent />);
      jest.runAllTimers(); // Ensure effects run
    }

    const metrics = performance.getComponentMetrics();
    expect(metrics[0].renderCount).toBe(3);
    expect(metrics[0].averageRenderTime).toBeGreaterThan(0);
  });

  it('identifies slow components', () => {
    // Mock a slow component render
    performance.trackComponentRender('SlowComponent', 50);
    performance.trackComponentRender('FastComponent', 5);

    const slowComponents = performance.getSlowComponents(16);
    expect(slowComponents).toHaveLength(1);
    expect(slowComponents[0].componentName).toBe('SlowComponent');
  });

  it('includes metadata in metrics', () => {
    const metadata = { userId: '123', action: 'test' };
    const endMeasure = performance.startMeasure('test-with-metadata', metadata);
    endMeasure();

    const metrics = performance.getMetrics();
    expect(metrics[0].metadata).toEqual(metadata);
  });

  it('clears all metrics', () => {
    performance.trackComponentRender('TestComponent', 10);
    const endMeasure = performance.startMeasure('test-operation');
    endMeasure();

    performance.clearMetrics();

    expect(performance.getMetrics()).toHaveLength(0);
    expect(performance.getComponentMetrics()).toHaveLength(0);
  });

  it('handles multiple renders without memory leaks', () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withPerformanceTracking(TestComponent);
    
    // Simulate a large number of renders (not too many to crash the test)
    for (let i = 0; i < 50; i++) {
      render(<WrappedComponent />);
      jest.runAllTimers();
    }
    
    const metrics = performance.getComponentMetrics();
    expect(metrics.length).toBe(1); // Should only have one component entry
    expect(metrics[0].renderCount).toBe(50);
    
    // Memory usage verification would require a more sophisticated approach
    // but this ensures the metrics structure doesn't grow unbounded
  });
});