import React from 'react';
import { performance } from './performance';

interface WithMemoConfig {
  measurePerformance?: boolean;
  name?: string;
}

export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
  config: WithMemoConfig = {}
): React.FC<P> {
  const { measurePerformance = false, name = Component.displayName || Component.name } = config;

  const MemoizedComponent = React.memo(
    React.forwardRef<unknown, P>((props, ref) => {
      let renderStartTime = 0;

      if (measurePerformance) {
        renderStartTime = Date.now();
      }

      const element = (
        <Component 
          {...props} 
          ref={ref as React.Ref<any>}
        />
      );

      if (measurePerformance) {
        const renderTime = Date.now() - renderStartTime;
        performance.trackComponentRender(name, renderTime);
      }

      return element;
    }),
    propsAreEqual
  );

  // Preserve display name for dev tools
  MemoizedComponent.displayName = `withMemo(${name})`;

  return MemoizedComponent;
}

export function withMemoTracking<P extends object>(
  Component: React.ComponentType<P>,
  config: WithMemoConfig = {}
): React.FC<P> {
  return withMemo(Component, undefined, { ...config, measurePerformance: true });
}

export function memoizeFunction<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList = []
): T {
  return React.useCallback((...args: Parameters<T>) => {
    const endMeasure = performance.startMeasure(`${fn.name || 'anonymous'}_execution`);
    const result = fn(...args);
    endMeasure();
    return result;
  }, deps) as T;
}