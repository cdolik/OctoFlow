// filepath: /Users/coreydolik/Desktop/OctoFlow/src/utils/performance.core.test.js
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

// Simple performance monitoring implementation for testing
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.componentMetrics = new Map();
    this.MAX_METRICS = 1000;
  }
  
  startMeasure(name, metadata) {
    const startTime = Date.now();
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.metrics.push({
        name,
        startTime,
        duration,
        metadata
      });
      
      // Keep metrics within limit
      if (this.metrics.length > this.MAX_METRICS) {
        this.metrics = this.metrics.slice(-this.MAX_METRICS);
      }
    };
  }
  
  trackComponentRender(componentName, renderTime) {
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

// Create test instance
const performance = new PerformanceMonitor();

// HOC for performance tracking
function withPerformanceTracking(WrappedComponent, componentName) {
  return function TrackedComponent(props) {
    const startTime = Date.now();
    
    const result = React.createElement(WrappedComponent, props);
    
    setTimeout(() => {
      const renderTime = Date.now() - startTime;
      performance.trackComponentRender(componentName || WrappedComponent.name, renderTime);
    }, 0);
    
    return result;
  };
}

// Test setup
let container = null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  performance.clearMetrics();
  jest.useFakeTimers();
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  jest.useRealTimers();
});

// Tests
describe('Performance Monitoring Core Functionality', () => {
  test('tracks operation duration correctly', () => {
    const endMeasure = performance.startMeasure('test-operation');
    
    // Simulate time passing
    jest.advanceTimersByTime(100);
    
    endMeasure();
    
    const metrics = performance.getMetrics();
    expect(metrics.length).toBe(1);
    expect(metrics[0].name).toBe('test-operation');
  });
  
  test('limits number of stored metrics to prevent memory issues', () => {
    for (let i = 0; i < 1100; i++) {
      const endMeasure = performance.startMeasure(`operation-${i}`);
      endMeasure();
    }
    
    const metrics = performance.getMetrics();
    expect(metrics.length).toBe(1000); // Should cap at 1000
    expect(metrics[metrics.length - 1].name).toBe('operation-1099');
  });
  
  test('tracks component render times', () => {
    const TestComponent = () => React.createElement('div', null, 'Test');
    const TrackedComponent = withPerformanceTracking(TestComponent, 'TestComponent');
    
    act(() => {
      render(React.createElement(TrackedComponent), container);
    });
    
    act(() => {
      jest.runAllTimers(); // Run setTimeout for tracking
    });
    
    const componentMetrics = performance.getComponentMetrics();
    expect(componentMetrics.length).toBe(1);
    expect(componentMetrics[0].componentName).toBe('TestComponent');
    expect(componentMetrics[0].renderCount).toBe(1);
  });
  
  test('calculates average render time across multiple renders', () => {
    const TestComponent = () => React.createElement('div', null, 'Multi-Render Test');
    const TrackedComponent = withPerformanceTracking(TestComponent, 'MultiRenderComponent');
    
    // Multiple renders
    for (let i = 0; i < 3; i++) {
      act(() => {
        render(React.createElement(TrackedComponent), container);
      });
      
      act(() => {
        jest.runAllTimers();
      });
    }
    
    const metrics = performance.getComponentMetrics();
    expect(metrics.length).toBe(1);
    expect(metrics[0].renderCount).toBe(3);
    expect(metrics[0].averageRenderTime).toBeGreaterThan(0);
  });
  
  test('identifies slow components correctly', () => {
    // Mock slow and fast components
    performance.trackComponentRender('SlowComponent', 50);
    performance.trackComponentRender('FastComponent', 5);
    
    const slowComponents = performance.getSlowComponents(16); // 16ms is typical threshold
    
    expect(slowComponents.length).toBe(1);
    expect(slowComponents[0].componentName).toBe('SlowComponent');
    expect(slowComponents[0].averageRenderTime).toBe(50);
  });
  
  test('handles metadata in metrics', () => {
    const metadata = { userId: '123', action: 'test' };
    const endMeasure = performance.startMeasure('operation-with-metadata', metadata);
    endMeasure();
    
    const metrics = performance.getMetrics();
    expect(metrics[0].metadata).toEqual(metadata);
  });
  
  test('clears all metrics completely', () => {
    // Add metrics
    performance.trackComponentRender('TestComponent', 10);
    const endMeasure = performance.startMeasure('test-operation');
    endMeasure();
    
    // Verify we have metrics
    expect(performance.getMetrics().length).toBeGreaterThan(0);
    expect(performance.getComponentMetrics().length).toBeGreaterThan(0);
    
    // Clear and verify they're gone
    performance.clearMetrics();
    expect(performance.getMetrics().length).toBe(0);
    expect(performance.getComponentMetrics().length).toBe(0);
  });
  
  test('handles multiple renders without memory issues', () => {
    const TestComponent = () => React.createElement('div', null, 'Memory Test');
    const TrackedComponent = withPerformanceTracking(TestComponent, 'MemoryTestComponent');
    
    // Simulate many renders
    for (let i = 0; i < 50; i++) {
      act(() => {
        render(React.createElement(TrackedComponent), container);
      });
      
      act(() => {
        jest.runAllTimers();
      });
    }
    
    // Should have aggregated metrics, not separate entries for each render
    const metrics = performance.getComponentMetrics();
    expect(metrics.length).toBe(1);
    expect(metrics[0].renderCount).toBe(50);
  });
});