import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock server to avoid MSW dependency issues
jest.mock('../mocks/server', () => ({
  server: {
    listen: jest.fn(),
    resetHandlers: jest.fn(),
    close: jest.fn(),
  }
}));

// Create mocks for browser APIs
const mockPerformanceNow = jest.fn();
mockPerformanceNow.mockReturnValue(0);

// Save original
const originalPerformanceNow = global.performance.now;

// Import after mocks are set up
import { performance, withPerformanceTracking } from './performance.tsx';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    performance.clearMetrics();
    mockPerformanceNow.mockClear();

    // Reset the mock timer
    let timeCounter = 0;
    mockPerformanceNow.mockImplementation(() => {
      timeCounter += 10;
      return timeCounter;
    });

    // Replace global implementation
    global.performance.now = mockPerformanceNow;
    
    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original implementation
    global.performance.now = originalPerformanceNow;
    jest.useRealTimers();
  });

  test('startMeasure tracks operation duration correctly', () => {
    const endMeasure = performance.startMeasure('test-operation');
    
    // Simulate time passing
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    endMeasure();
    
    const metrics = performance.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test-operation');
    expect(metrics[0].duration).toBeGreaterThan(0);
  });

  test('limits metrics storage to prevent memory issues', () => {
    for (let i = 0; i < 1100; i++) {
      const endMeasure = performance.startMeasure(`operation-${i}`);
      endMeasure();
    }
    
    const metrics = performance.getMetrics();
    expect(metrics).toHaveLength(1000); // Should cap at 1000 metrics
    expect(metrics[metrics.length - 1].name).toBe('operation-1099');
  });

  test('tracks component render times with HOC', () => {
    // Create a simple test component
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withPerformanceTracking(TestComponent, 'TestComponent');
    
    // First render
    render(<WrappedComponent />);
    
    // Run effects to complete tracking
    act(() => {
      jest.runAllTimers();
    });
    
    const metrics = performance.getComponentMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].componentName).toBe('TestComponent');
    expect(metrics[0].renderCount).toBe(1);
  });

  test('calculates average render time across multiple renders', () => {
    const TestComponent = () => <div>Multiple Render Test</div>;
    const WrappedComponent = withPerformanceTracking(TestComponent, 'MultiRenderTest');
    
    // Render multiple times
    for (let i = 0; i < 3; i++) {
      render(<WrappedComponent />);
      act(() => {
        jest.runAllTimers();
      });
    }
    
    const metrics = performance.getComponentMetrics();
    expect(metrics[0].componentName).toBe('MultiRenderTest');
    expect(metrics[0].renderCount).toBe(3);
    expect(metrics[0].averageRenderTime).toBeGreaterThan(0);
  });

  test('identifies slow components correctly', () => {
    // Mock tracking data for components
    performance.trackComponentRender('SlowComponent', 50);
    performance.trackComponentRender('FastComponent', 5);
    
    // Get components slower than 16ms (typical performance budget)
    const slowComponents = performance.getSlowComponents(16);
    
    expect(slowComponents).toHaveLength(1);
    expect(slowComponents[0].componentName).toBe('SlowComponent');
    expect(slowComponents[0].averageRenderTime).toBe(50);
  });

  test('stores metadata with metrics', () => {
    const metadata = { userId: '123', action: 'click' };
    const endMeasure = performance.startMeasure('test-with-metadata', metadata);
    endMeasure();
    
    const metrics = performance.getMetrics();
    expect(metrics[0].metadata).toEqual(metadata);
  });

  test('clearMetrics resets all tracking data', () => {
    // Add some metrics first
    performance.trackComponentRender('TestComponent', 10);
    const endMeasure = performance.startMeasure('test-operation');
    endMeasure();
    
    // Verify we have metrics
    expect(performance.getMetrics().length).toBeGreaterThan(0);
    expect(performance.getComponentMetrics().length).toBeGreaterThan(0);
    
    // Clear metrics
    performance.clearMetrics();
    
    // Verify they're gone
    expect(performance.getMetrics()).toHaveLength(0);
    expect(performance.getComponentMetrics()).toHaveLength(0);
  });

  test('handles high volume of render tracking without memory issues', () => {
    const TestComponent = () => <div>Memory Test</div>;
    const WrappedComponent = withPerformanceTracking(TestComponent);
    
    // Track a large but reasonable number of renders
    for (let i = 0; i < 50; i++) {
      render(<WrappedComponent />);
      act(() => {
        jest.runAllTimers();
      });
    }
    
    // We should only have one component tracked (not 50 separate entries)
    const metrics = performance.getComponentMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].renderCount).toBe(50);
  });
});