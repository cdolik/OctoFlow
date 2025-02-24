import React, { useMemo, useCallback } from 'react';
import { performance } from './performance';

interface MemoConfig<P> {
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;
  propsToTrack?: Array<keyof P>;
  name?: string;
  measurePerformance?: boolean;
}

export function withMemo<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: MemoConfig<P> = {}
): React.FC<P> {
  const {
    propsAreEqual,
    propsToTrack,
    name = WrappedComponent.displayName || WrappedComponent.name,
    measurePerformance = process.env.NODE_ENV !== 'production'
  } = config;

  const MemoizedComponent = React.memo(
    (props: P) => {
      const renderStartTime = measurePerformance ? performance.now() : 0;

      // Memoize expensive computations based on tracked props
      const trackedProps = useMemo(() => {
        if (!propsToTrack) return props;
        return Object.fromEntries(
          propsToTrack.map(key => [key, props[key]])
        );
      }, propsToTrack ? propsToTrack.map(key => props[key]) : Object.values(props));

      // Track render performance
      React.useEffect(() => {
        if (measurePerformance) {
          const renderTime = performance.now() - renderStartTime;
          performance.trackComponentRender(name, renderTime);
        }
      });

      return <WrappedComponent {...props} />;
    },
    propsAreEqual
  );

  // Preserve display name for dev tools
  MemoizedComponent.displayName = `WithMemo(${name})`;

  return MemoizedComponent;
}

// Helper hook for memoizing expensive calculations
export function useMemoWithPerf<T>(
  factory: () => T,
  deps: React.DependencyList,
  operationName: string
): T {
  const endMeasure = performance.startMeasure(
    `calc-${operationName}`,
    { type: 'calculation' }
  );

  const result = useMemo(() => {
    const value = factory();
    endMeasure();
    return value;
  }, deps);

  return result;
}

// Helper hook for memoizing callbacks with performance tracking
export function useCallbackWithPerf<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  operationName: string
): T {
  return useCallback((...args: Parameters<T>) => {
    const endMeasure = performance.startMeasure(
      `callback-${operationName}`,
      { type: 'callback' }
    );
    const result = callback(...args);
    endMeasure();
    return result;
  }, deps);
}