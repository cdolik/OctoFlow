/**
 * Performance Monitoring System Tests
 * 
 * Note: These tests use performance.dispose() for cleanup to prevent state leakage.
 * Cleanup occurs:
 * - Before all tests (beforeAll)
 * - After each test (afterEach)
 * - After all tests (afterAll)
 * 
 * Test categories:
 * - Component Performance Tracking
 * - Hook Usage
 * - Slow Component Detection
 * - Memory Management
 * - Error Handling
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { performance as perfMonitor, withPerformanceTracking, usePerformanceTracking, PerformanceMonitor } from '../performance';
import { PERFORMANCE_CONFIG } from '../performance.config';

// Mock component for testing
const TestComponent: React.FC<{ text: string }> = ({ text }) => (
  <div data-testid="test-component">{text}</div>
);

describe('Performance Monitoring System', () => {
  // Global cleanup to prevent state leakage
  beforeAll(() => {
    console.log('Initializing test suite - cleaning performance monitor state');
    perfMonitor.dispose();
  });

  beforeEach(() => {
    // Reset to default configuration before each test
    perfMonitor.dispose();
    PerformanceMonitor.getInstance({
      sampleRate: 1.0, // Full sampling for tests
      enableMemoryTracking: true,
      enableInteractionTracking: true
    });
  });

  afterEach(() => {
    console.log('Cleaning up after test - resetting performance monitor state');
    perfMonitor.dispose();
  });

  afterAll(() => {
    console.log('Test suite completed - final cleanup');
    perfMonitor.dispose();
  });

  describe('Component Performance Tracking', () => {
    it('should track component render times', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'TestComponent');
      render(<TrackedComponent text="test" />);

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].componentName).toBe('TestComponent');
      expect(metrics[0].renderCount).toBe(1);
      expect(metrics[0].averageRenderTime).toBeGreaterThan(0);
    });

    it('should track multiple renders', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'TestComponent');
      const { rerender } = render(<TrackedComponent text="test" />);
      rerender(<TrackedComponent text="updated" />);

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].renderCount).toBe(2);
    });

    it('should track interaction counts', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'InteractionTest');
      render(<TrackedComponent text="click me" />);
      
      fireEvent.click(screen.getByTestId('test-component'));

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].interactionCount).toBe(1);
    });
  });

  describe('Performance Hook Usage', () => {
    const HookedComponent: React.FC = () => {
      usePerformanceTracking('HookedComponent');
      return <div data-testid="hooked">Hooked</div>;
    };

    it('should track performance using hook', () => {
      render(<HookedComponent />);

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].componentName).toBe('HookedComponent');
    });
  });

  describe('Slow Component Detection', () => {
    const thresholdMs = PERFORMANCE_CONFIG.thresholds.render;

    beforeEach(() => {
      perfMonitor.dispose();
      PerformanceMonitor.getInstance({
        slowThreshold: thresholdMs,
        sampleRate: 1.0
      });
    });

    it('should identify components exactly at threshold', () => {
      const BoundaryComponent = withPerformanceTracking(() => {
        const start = window.performance.now();
        while (window.performance.now() - start < thresholdMs) {} // Exactly at threshold
        return <div data-testid="boundary-component">Boundary</div>;
      }, 'BoundaryComponent');

      render(<BoundaryComponent />);
      const slowComponents = perfMonitor.getSlowComponents();
      expect(slowComponents.length).toBe(0); // Should not be considered slow
    });

    it('should identify components just above threshold', () => {
      const JustSlowComponent = withPerformanceTracking(() => {
        const start = window.performance.now();
        while (window.performance.now() - start < thresholdMs + 1) {} // Just above threshold
        return <div data-testid="just-slow-component">Just Slow</div>;
      }, 'JustSlowComponent');

      render(<JustSlowComponent />);
      const slowComponents = perfMonitor.getSlowComponents();
      expect(slowComponents.length).toBe(1);
      expect(slowComponents[0].averageRenderTime).toBeGreaterThan(thresholdMs);
      expect(slowComponents[0].averageRenderTime).toBeLessThan(thresholdMs + 5);
    });
  });

  describe('Memory Usage Tracking', () => {
    it('should track memory usage when available', () => {
      // Mock performance.memory
      const originalPerformance = global.performance;
      (global as any).performance = {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 1000000
        }
      };

      const TrackedComponent = withPerformanceTracking(TestComponent, 'MemoryTest');
      render(<TrackedComponent text="test" />);

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].memoryUsage).toBeDefined();
      expect(metrics[0].memoryUsage).toBe(1000000);

      // Restore original performance object
      global.performance = originalPerformance;
    });
  });

  describe('Error Handling', () => {
    it('should handle missing PerformanceObserver gracefully', () => {
      const originalPerformanceObserver = global.PerformanceObserver;
      global.PerformanceObserver = undefined as any;

      expect(() => {
        const TrackedComponent = withPerformanceTracking(TestComponent);
        render(<TrackedComponent text="test" />);
      }).not.toThrow();

      global.PerformanceObserver = originalPerformanceObserver;
    });

    it('should handle missing performance.memory gracefully', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'NoMemoryTest');
      render(<TrackedComponent text="test" />);

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].memoryUsage).toBeUndefined();
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain singleton instance across multiple instantiations', () => {
      const instance1 = perfMonitor;
      const instance2 = PerformanceMonitor.getInstance();
      const instance3 = PerformanceMonitor.getInstance({ 
        enableMemoryTracking: false 
      });

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      // Config changes after initialization should not create new instance
      expect(instance3.getComponentMetrics()).toEqual(instance1.getComponentMetrics());
    });
  });

  describe('Feature Toggles', () => {
    it('should respect enableMemoryTracking toggle', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'MemoryTest');
      
      // Mock memory API
      const mockMemory = { usedJSHeapSize: 1000000 };
      jest.spyOn(global.performance as any, 'memory', 'get').mockReturnValue(mockMemory);

      // With memory tracking enabled
      render(<TrackedComponent text="test" />);
      let metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].memoryUsage).toBeDefined();

      // With memory tracking disabled
      perfMonitor.dispose();
      PerformanceMonitor.getInstance({ enableMemoryTracking: false });
      render(<TrackedComponent text="test" />);
      metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].memoryUsage).toBeUndefined();
    });

    it('should respect enableInteractionTracking toggle', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'InteractionTest');
      render(<TrackedComponent text="click me" />);

      fireEvent.click(screen.getByTestId('test-component'));
      let metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].interactionCount).toBe(1);

      // With interaction tracking disabled
      perfMonitor.dispose();
      PerformanceMonitor.getInstance({ enableInteractionTracking: false });
      render(<TrackedComponent text="click me" />);
      fireEvent.click(screen.getByTestId('test-component'));
      metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].interactionCount).toBe(0);
    });
  });

  describe('Metrics Collection', () => {
    it('should respect sampleRate configuration', () => {
      perfMonitor.dispose();
      PerformanceMonitor.getInstance({ sampleRate: 0 });
      const TrackedComponent = withPerformanceTracking(TestComponent, 'SampleTest');
      render(<TrackedComponent text="test" />);
      
      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics.length).toBe(0);
    });

    it('should respect maxMetrics limit', () => {
      perfMonitor.dispose();
      PerformanceMonitor.getInstance({ maxMetrics: 2 });
      const TrackedComponent = withPerformanceTracking(TestComponent, 'MaxTest');
      
      // Render multiple times to generate metrics
      for (let i = 0; i < 5; i++) {
        render(<TrackedComponent text={`test ${i}`} />);
      }
      
      const metrics = perfMonitor.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(2);
    });

    it('should detect slow components correctly', () => {
      const SlowComponent = withPerformanceTracking(() => {
        const start = Date.now();
        while (Date.now() - start < 20) {} // Simulate slow render
        return <div>Slow</div>;
      }, 'SlowComponent');

      render(<SlowComponent />);
      const slowComponents = perfMonitor.getSlowComponents();
      expect(slowComponents.length).toBe(1);
      expect(slowComponents[0].componentName).toBe('SlowComponent');
      expect(slowComponents[0].averageRenderTime).toBeGreaterThan(16); // Default slowThreshold
    });
  });

  describe('Error and Edge Cases', () => {
    it('should handle rapid toggling gracefully', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'ToggleTest');
      const { rerender } = render(<TrackedComponent text="test" />);
      
      // Rapid rerendering
      for (let i = 0; i < 100; i++) {
        rerender(<TrackedComponent text={`test ${i}`} />);
      }
      
      expect(() => perfMonitor.getComponentMetrics()).not.toThrow();
    });

    it('should handle missing APIs gracefully', () => {
      const originalPerformanceObserver = global.PerformanceObserver;
      global.PerformanceObserver = undefined as any;

      expect(() => {
        const TrackedComponent = withPerformanceTracking(TestComponent);
        render(<TrackedComponent text="test" />);
      }).not.toThrow();

      global.PerformanceObserver = originalPerformanceObserver;
    });
  });

  describe('Memory Management', () => {
    beforeEach(() => {
      perfMonitor.dispose();
      PerformanceMonitor.getInstance({
        enableMemoryTracking: true,
        sampleRate: 1.0
      });
    });

    it('should properly clean up resources when component unmounts', () => {
      const TrackedComponent = withPerformanceTracking(TestComponent, 'CleanupTest');
      const { unmount } = render(<TrackedComponent text="test" />);
      
      // Get initial metrics
      const initialMetrics = perfMonitor.getComponentMetrics();
      expect(initialMetrics.length).toBe(1);
      expect(initialMetrics[0].memoryUsage).toBeDefined();
      
      // Unmount component
      unmount();
      
      // Force garbage collection if possible
      if (global.gc) {
        global.gc();
      }
      
      // Check metrics after unmount
      const finalMetrics = perfMonitor.getComponentMetrics();
      expect(finalMetrics[0].renderCount).toBe(1);
      expect(finalMetrics[0].memoryUsage).toBeDefined();
    });

    it('should handle memory leaks gracefully', () => {
      const LeakyComponent = withPerformanceTracking(() => {
        const [items] = React.useState(() => new Array(1000000).fill(0));
        return <div>{items.length}</div>;
      }, 'LeakyComponent');

      const { unmount } = render(<LeakyComponent />);
      unmount();

      // Should not throw when collecting metrics after potential memory leak
      expect(() => perfMonitor.getComponentMetrics()).not.toThrow();
    });
  });

  describe('Error Boundary Tests', () => {
    it('should handle errors in performance measurement gracefully', () => {
      // Mock performance.now to simulate timing errors
      const originalNow = window.performance.now;
      window.performance.now = () => {
        throw new Error('Timing API error');
      };

      const ErrorComponent = withPerformanceTracking(TestComponent, 'ErrorTest');
      
      // Should not throw when rendering despite timing API error
      expect(() => render(<ErrorComponent text="test" />)).not.toThrow();

      // Restore original performance.now
      window.performance.now = originalNow;
    });

    it('should handle invalid configuration gracefully', () => {
      // Test with invalid sample rate
      expect(() => {
        perfMonitor.dispose();
        PerformanceMonitor.getInstance({ sampleRate: -1 });
      }).not.toThrow();

      // Test with invalid threshold
      expect(() => {
        perfMonitor.dispose();
        PerformanceMonitor.getInstance({ slowThreshold: -1 });
      }).not.toThrow();
    });

    it('should handle concurrent renders safely', async () => {
      const ConcurrentComponent = withPerformanceTracking(() => {
        const [count, setCount] = React.useState(0);
        React.useEffect(() => {
          setCount(1); // Force a re-render
        }, []);
        return <div>{count}</div>;
      }, 'ConcurrentTest');

      render(<ConcurrentComponent />);
      
      // Wait for concurrent renders to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const metrics = perfMonitor.getComponentMetrics();
      expect(metrics[0].renderCount).toBeGreaterThanOrEqual(2);
    });
  });
}); 