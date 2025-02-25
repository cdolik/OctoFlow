import { performance, withPerformanceTracking } from './performance';
import React from 'react';
import { render } from '@testing-library/react';

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
    const WrappedComponent = withPerformanceTracking(TestComponent, 'TestComponent');

    render(<WrappedComponent />);

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
});

// Mock PerformanceObserver for testing
class MockPerformanceObserver {
  private callback: (list: PerformanceObserverEntryList) => void;

  constructor(callback: (list: PerformanceObserverEntryList) => void) {
    this.callback = callback;
  }

  observe() {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }
}

describe('PerformanceObserver Integration', () => {
  beforeEach(() => {
    // @ts-ignore
    global.PerformanceObserver = MockPerformanceObserver;
  });

  it('sets up performance observers', () => {
    const observerSpy = jest.spyOn(global, 'PerformanceObserver');
    performance.clearMetrics(); // This will reinitialize the monitor

    expect(observerSpy).toHaveBeenCalled();
  });
});

import { getComponentMetrics } from './performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });

  it('measures component render time', () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    const WrappedComponent = getComponentMetrics(TestComponent);

    render(<WrappedComponent />);

    const componentMetrics = performance.getEntriesByType('measure');
    expect(componentMetrics.length).toBeGreaterThan(0);
  });

  it('handles multiple renders', () => {
    const TestComponent: React.FC = () => <div>Test</div>;
    const WrappedComponent = getComponentMetrics(TestComponent);

    for (let i = 0; i < 3; i++) {
      render(<WrappedComponent />);
    }

    const componentMetrics = performance.getEntriesByType('measure');
    expect(componentMetrics.length).toBe(3);
  });
});