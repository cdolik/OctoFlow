import React, { ComponentType } from 'react';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { ErrorFallback } from '../components/ErrorFallback';
import { Stage } from '../types';

interface ErrorBoundaryProps {
  stage?: Stage;
  showDetails?: boolean;
  onUnrecoverableError?: (error: Error) => void;
  FallbackComponent?: ComponentType<{ error: Error; resetError: () => void }>;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: ErrorBoundaryProps = {}
) {
  return function WithErrorBoundaryWrapper(props: P) {
    const {
      stage,
      showDetails = false,
      FallbackComponent = ErrorFallback,
      onUnrecoverableError
    } = options;

    const {
      error,
      isRecovering,
      hasCriticalError,
      handleError,
      clearError
    } = useErrorManagement({
      stage,
      onUnrecoverableError
    });

    if (error) {
      return (
        <FallbackComponent
          error={error}
          resetError={clearError}
          {...(showDetails && { showDetails })}
        />
      );
    }

    return (
      <WrappedComponent
        {...props}
        onError={handleError}
        isRecovering={isRecovering}
        hasCriticalError={hasCriticalError}
      />
    );
  };
}