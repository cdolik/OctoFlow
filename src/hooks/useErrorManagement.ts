import { useState, useCallback } from 'react';
import { AssessmentError, ErrorSeverity } from '../types/errors';
import { handleError } from '../utils/errorHandling';

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

export const useErrorManagement = (): UseErrorManagementResult => {
  const [errorState, setErrorState] = useState<ErrorState>({
    active: false,
    error: null,
    isRecovering: false
  });

  const handleErrorInternal = useCallback(async (
    error: unknown,
    recover?: () => Promise<boolean>
  ): Promise<boolean> => {
    // Reset error state
    setErrorState(prev => ({
      ...prev,
      active: true,
      error: error as AssessmentError,
      isRecovering: !!recover
    }));

    try {
      const recovered = await handleError(error as AssessmentError, recover);
      
      setErrorState(prev => ({
        ...prev,
        active: !recovered,
        isRecovering: false
      }));

      return recovered;
    } catch (e) {
      setErrorState(prev => ({
        ...prev,
        active: true,
        isRecovering: false
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      active: false,
      error: null,
      isRecovering: false
    });
  }, []);

  const hasCriticalError = errorState.active && 
    errorState.error?.severity === 'critical' &&
    !errorState.error?.recoverable;

  return {
    error: errorState.error,
    isRecovering: errorState.isRecovering,
    handleError: handleErrorInternal,
    clearError,
    hasCriticalError
  };
};