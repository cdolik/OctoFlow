import { useState, useCallback } from 'react';
import { AssessmentError, ErrorContext } from '../types/errors';
import { Stage } from '../types';
import { errorReporter } from '../utils/errorReporting';
import { useError } from '../contexts/ErrorContext';

interface UseErrorManagementOptions {
  stage?: Stage;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

interface ErrorState {
  activeErrorCount: number;
  isHandlingError: boolean;
  lastError: Error | null;
}

export function useErrorManagement(options: UseErrorManagementOptions = {}) {
  const { handleError: handleContextError } = useError();
  const [state, setState] = useState<ErrorState>({
    activeErrorCount: 0,
    isHandlingError: false,
    lastError: null
  });

  const handleError = useCallback(async (
    error: unknown,
    recover?: () => Promise<boolean>
  ): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isHandlingError: true,
      activeErrorCount: prev.activeErrorCount + 1,
      lastError: error instanceof Error ? error : new Error(String(error))
    }));

    const context: ErrorContext = {
      stage: options.stage,
      metadata: {
        timestamp: Date.now(),
        retryCount: state.activeErrorCount
      }
    };

    try {
      const result = await handleContextError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );

      if (result.recovered) {
        setState(prev => ({
          ...prev,
          isHandlingError: false,
          activeErrorCount: Math.max(0, prev.activeErrorCount - 1)
        }));
        return true;
      }

      if (recover) {
        const recovered = await recover();
        if (recovered) {
          setState(prev => ({
            ...prev,
            isHandlingError: false,
            activeErrorCount: Math.max(0, prev.activeErrorCount - 1)
          }));
          return true;
        }
      }

      return false;
    } catch (recoveryError) {
      options.onError?.(
        recoveryError instanceof Error ? recoveryError : new Error(String(recoveryError))
      );
      return false;
    } finally {
      setState(prev => ({ ...prev, isHandlingError: false }));
    }
  }, [handleContextError, options, state.activeErrorCount]);

  const clearError = useCallback((errorId?: string) => {
    if (errorId) {
      errorReporter.resolve(errorId);
    }
    setState(prev => ({
      ...prev,
      activeErrorCount: Math.max(0, prev.activeErrorCount - 1),
      lastError: null
    }));
  }, []);

  const getActiveErrors = useCallback(() => {
    return errorReporter.getActiveErrors();
  }, []);

  return {
    activeErrorCount: state.activeErrorCount,
    isHandlingError: state.isHandlingError,
    lastError: state.lastError,
    handleError,
    clearError,
    getActiveErrors
  };
}