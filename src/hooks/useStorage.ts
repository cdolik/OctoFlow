import { useState, useEffect, useCallback } from 'react';
import { Stage, AssessmentState } from '../types';
import { StorageManager } from '../utils/storage/storageManager';

interface UseStorageOptions {
  autoSave?: boolean;
  backupInterval?: number;
  onError?: (error: Error) => void;
}

export const useStorage = (options: UseStorageOptions = {}) => {
  const [storageManager] = useState(() => new StorageManager());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<AssessmentState | null>(null);

  // Initialize storage and load state
  useEffect(() => {
    const loadState = async () => {
      try {
        setIsLoading(true);
        const savedState = await storageManager.getState();
        
        if (savedState) {
          // Ensure state is on latest version
          const migratedState = await storageManager.migrateToLatestVersion(savedState);
          setState(migratedState);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load state');
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Auto-backup functionality
  useEffect(() => {
    if (!options.backupInterval) return;

    const backupTimer = setInterval(() => {
      storageManager.createBackup().catch(err => {
        options.onError?.(err instanceof Error ? err : new Error('Backup failed'));
      });
    }, options.backupInterval);

    return () => clearInterval(backupTimer);
  }, [options.backupInterval]);

  const saveState = useCallback(async (newState: AssessmentState): Promise<boolean> => {
    try {
      const success = await storageManager.saveState(newState);
      if (success) {
        setState(newState);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save state');
      setError(error);
      options.onError?.(error);
      return false;
    }
  }, []);

  const recoverFromBackup = useCallback(async (): Promise<boolean> => {
    try {
      const backup = await storageManager.restoreFromBackup();
      if (backup) {
        setState(backup);
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Recovery failed');
      setError(error);
      options.onError?.(error);
      return false;
    }
  }, []);

  const clearStorage = useCallback(async () => {
    try {
      await storageManager.clearStorage();
      setState(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear storage');
      setError(error);
      options.onError?.(error);
    }
  }, []);

  return {
    state,
    saveState,
    recoverFromBackup,
    clearStorage,
    isLoading,
    error
  };
};