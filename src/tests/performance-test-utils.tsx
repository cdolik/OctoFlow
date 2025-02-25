import { renderHook } from '@testing-library/react';
import { performance as perf } from '../utils/performance';
import { TestContextProvider } from './TestContextProvider';

interface PerformanceTestOptions {
  iterations?: number;
  warmupIterations?: number;
  maxDuration?: number;
}

export async function measureComponentPerformance(
  Component: React.ComponentType<any>,
  props: Record<string, any> = {},
  options: PerformanceTestOptions = {}
) {
  const {
    iterations = 100,
    warmupIterations = 10,
    maxDuration = 16 // 16ms = 60fps threshold
  } = options;

  // Warm-up phase
  for (let i = 0; i < warmupIterations; i++) {
    const { unmount } = render(
      <TestContextProvider>
        <Component {...props} />
      </TestContextProvider>
    );
    unmount();
  }

  const measurements: number[] = [];
  
  // Measurement phase
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const { unmount } = render(
      <TestContextProvider>
        <Component {...props} />
      </TestContextProvider>
    );
    const duration = performance.now() - start;
    measurements.push(duration);
    unmount();
  }

  const averageDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const maxMeasurement = Math.max(...measurements);
  const performanceWarning = averageDuration > maxDuration;

  return {
    averageDuration,
    maxDuration: maxMeasurement,
    measurements,
    performanceWarning,
    exceedsThreshold: averageDuration > maxDuration
  };
}

export function measureHookPerformance<T>(
  hook: () => T,
  options: PerformanceTestOptions = {}
) {
  const { iterations = 100, maxDuration = 5 } = options;
  const measurements: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const { result, unmount } = renderHook(hook, {
      wrapper: TestContextProvider
    });
    const duration = performance.now() - start;
    measurements.push(duration);
    unmount();
  }

  return {
    averageDuration: measurements.reduce((a, b) => a + b, 0) / measurements.length,
    maxDuration: Math.max(...measurements),
    measurements,
    exceedsThreshold: measurements.some(m => m > maxDuration)
  };
}

export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  options = { threshold: 16 }
) {
  const WrappedComponent = (props: P) => {
    const start = performance.now();
    const result = <Component {...props} />;
    const duration = performance.now() - start;
    
    perf.trackComponentRender(Component.displayName || Component.name || 'Unknown', duration);
    
    return result;
  };

  WrappedComponent.displayName = `WithPerformance(${Component.displayName || Component.name || 'Unknown'})`;
  return WrappedComponent;
}