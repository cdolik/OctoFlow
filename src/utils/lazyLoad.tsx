import React, { lazy, Suspense, ComponentType } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

interface LazyLoadProps<P> {
  importFunc: () => Promise<{ default: ComponentType<P> }>;
  fallback?: React.ReactNode;
}

export function lazyLoad<P>({ importFunc, fallback = <LoadingSpinner /> }: LazyLoadProps<P>): React.FC<P> {
  const Component = lazy(importFunc);
  return (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}