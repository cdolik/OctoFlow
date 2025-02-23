import { useEffect, useCallback, useState } from 'react';
import { AssessmentError, ErrorSeverity } from '../types/errors';
import { handleError } from '../utils/errorHandling';
import { Stage } from '../types';
import errorReporter from '../utils/errorReporting';
import { useStorage } from './useStorage';
import { useStorageErrorHandler } from './useStorageErrorHandler';
import { trackError } from '../utils/analytics';

interface ErrorManagementOptions {
  stage?: Stage;
  maxRetries?: number;
  onUnrecoverableError?: (error: Error) => void;
  onRecoverySuccess?: () => void;
}

interface ErrorState {
  active: boolean;
  error: AssessmentError | null;
  isRecovering: boolean;
}

interface UseErrorManagementResult {
  error: AssessmentError | null;
  isRecovering: boolean;
  handleError: (error: unknown, recover?: () => Promise<boolean>) => Promise<boolean>;
  clearError: () => void;
  hasCriticalError: boolean;
}

export const useErrorManagement = (options: ErrorManagementOptions = {}): UseErrorManagementResult => {
  const [errorState, setErrorState] = useState<ErrorState>({
    active: false,
    error: null,
    isRecovering: false
  });

  const [activeErrorCount, setActiveErrorCount] = useState(0);
  const [isHandlingError, setIsHandlingError] = useState(false);

  const { state, saveState } = useStorage();
  const {
    handleStorageError,
    isRecovering,
    retryCount
  } = useStorageErrorHandler({
    maxRetries: options.maxRetries,
    onRecoverySuccess: options.onRecoverySuccess
  });

  // Subscribe to error updates
  useEffect(() => {
    const unsubscribe = errorReporter.subscribeToErrors(() => {
      const activeErrors = options.stage
        ? errorReporter.getErrorsForStage(options.stage)
        : errorReporter.getActiveErrors();
      
      setActiveErrorCount(activeErrors.length);
    });

    return unsubscribe;
  }, [options.stage]);

  const handleErrorInternal = useCallback(async (
    error: unknown,
    recover?: () => Promise<boolean>
  ): Promise<boolean> => {
    setIsHandlingError(true);
    // Reset error state
    setErrorState(prev => ({
      ...prev,
      active: true,
      error: error as AssessmentError,
      isRecovering: !!recover
    }));

    try {
      const errorId = errorReporter.reportError(error as Error, {
        stage: options.stage,
        responses: state?.responses,
        metadata: state?.metadata
      });

      // Attempt recovery for storage errors
      if ((error as Error).message.includes('storage')) {
        const recovered = await handleStorageError(error as Error);
        if (!recovered && options.onUnrecoverableError) {
          options.onUnrecoverableError(error as Error);
        }
      }

      // Track error context
      trackError('error_handled', {
        errorId,
        stage: options.stage,
        recoveryAttempts: retryCount,
        timestamp: Date.now()
      });

      setErrorState(prev => ({
        ...prev,
        active: !recovered,
        isRecovering: false
      }));

      return errorId;
    } catch (e) {
      setErrorState(prev => ({
        ...prev,
        active: true,
        isRecovering: false
      }));
      return false;
    } finally {
      setIsHandlingError(false);
    }
  }, [state, handleStorageError, retryCount, options]);

  const clearError = useCallback(async (errorId: string) => {
    const error = errorReporter.getError(errorId);
    if (!error) return;

    errorReporter.markErrorResolved(errorId);
    
    // If this was a storage error, try to save current state
    if (error.error.message.includes('storage') && state) {
      try {
        await saveState(state);
      } catch (e) {
        // If saving fails, don't throw - just track it
        trackError('error_resolution_failed', {
          originalErrorId: errorId,
          error: e instanceof Error ? e.message : 'Unknown error'
        });
      }
    }
  }, [state, saveState]);

  const getActiveErrors = useCallback(() => {
    return options.stage
      ? errorReporter.getErrorsForStage(options.stage)
      : errorReporter.getActiveErrors();
  }, [options.stage]);

  const hasCriticalError = errorState.active && 
    errorState.error?.severity === 'critical' &&
    !errorState.error?.recoverable;

  return {
    error: errorState.error,
    isRecovering: errorState.isRecovering,
    handleError: handleErrorInternal,
    clearError,
    hasCriticalError,
    getActiveErrors,
    activeErrorCount,
    isHandlingError,
    retryCount
  };
};