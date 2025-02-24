import React, { Suspense } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  retry?: boolean;
  onError?: (error: Error) => void;
}

export function lazyLoad<T extends React.ComponentType<any>>(
  importFactory: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFactory);
  
  const fallback = options.fallback ?? (
    <LoadingSpinner 
      message="Loading component..." 
      size="small"
      inline={true}
    />
  );

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}