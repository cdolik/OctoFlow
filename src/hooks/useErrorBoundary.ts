import { useCallback, useEffect, useState } from 'react';
import { useError } from '../contexts/ErrorContext';
import { AssessmentError, ErrorContext } from '../types/errors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export const useErrorBoundary = (componentName: string) => {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null
  });

  const { handleError, clearError } = useError();

  const handleCatch = useCallback(async (error: Error, errorInfo?: React.ErrorInfo) => {
    setState({
      hasError: true,
      error,
      errorInfo: errorInfo || null
    });

    const context: ErrorContext = {
      component: componentName,
      action: 'render',
      timestamp: new Date().toISOString()
    };

    if (error instanceof AssessmentError) {
      await handleError(error, context);
    } else {
      await handleError(
        new AssessmentError(error.message, {
          context,
          severity: 'high',
          recoverable: false
        }),
        context
      );
    }
  }, [componentName, handleError]);

  const resetError = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    clearError();
  }, [clearError]);

  useEffect(() => {
    return () => {
      if (state.hasError) {
        resetError();
      }
    };
  }, [resetError, state.hasError]);

  return {
    ...state,
    handleCatch,
    resetError
  };
};