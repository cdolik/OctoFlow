import { useState, useCallback, useEffect } from 'react';
import { useStorage } from './useStorage';
import { validateState } from '../utils/storage/migrations';
import { trackError } from '../utils/analytics';
import { AssessmentState } from '../types';

interface StorageErrorHandlerOptions {
  onRecoverySuccess?: () => void;
  onRecoveryFailure?: (error: Error) => void;
  maxRetries?: number;
}

export const useStorageErrorHandler = (options: StorageErrorHandlerOptions = {}) => {
  const { maxRetries = 3 } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const {
    state,
    saveState,
    recoverFromBackup,
    clearStorage,
    error: storageError
  } = useStorage({
    autoSave: true,
    backupInterval: 5 * 60 * 1000, // 5 minutes
    onError: (error) => setLastError(error)
  });

  const handleStorageError = useCallback(async (error: Error) => {
    setLastError(error);
    trackError('storage_error', { 
      error: error.message,
      retryCount,
      hasBackup: Boolean(state)
    });

    if (retryCount >= maxRetries) {
      options.onRecoveryFailure?.(error);
      return false;
    }

    setIsRecovering(true);
    setRetryCount(prev => prev + 1);

    try {
      // First try to recover from backup
      const backupState = await recoverFromBackup();
      if (backupState && validateState(backupState)) {
        options.onRecoverySuccess?.();
        return true;
      }

      // If backup recovery fails, try to salvage current state
      if (state && validateState(state)) {
        await saveState(state);
        options.onRecoverySuccess?.();
        return true;
      }

      // If all recovery attempts fail, clear storage and start fresh
      await clearStorage();
      const freshState: AssessmentState = {
        version: '1.2',
        responses: {},
        currentStage: null,
        scores: null,
        metadata: {
          lastSaved: new Date().toISOString(),
          questionCount: 0,
          timeSpent: 0,
          isComplete: false,
          attemptCount: 1,
          lastAttempt: new Date().toISOString()
        }
      };
      await saveState(freshState);
      return true;
    } catch (recoveryError) {
      trackError('recovery_error', {
        error: recoveryError instanceof Error ? recoveryError.message : 'Unknown error',
        originalError: error.message
      });
      options.onRecoveryFailure?.(error);
      return false;
    } finally {
      setIsRecovering(false);
    }
  }, [retryCount, maxRetries, state, recoverFromBackup, saveState, clearStorage]);

  // Handle storage errors automatically
  useEffect(() => {
    if (storageError) {
      handleStorageError(storageError);
    }
  }, [storageError, handleStorageError]);

  return {
    isRecovering,
    lastError,
    retryCount,
    handleStorageError,
    canRetry: retryCount < maxRetries
  };
};
