import { useState, useCallback, useEffect, useRef } from 'react';
import { StorageState } from '../types';
import { trackError } from '../utils/analytics';

interface UseStorageConfig {
  autoSave?: boolean;
  backupInterval?: number;
}

interface UseStorageResult {
  state: StorageState | null;
  saveState: (newState: StorageState) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

const STORAGE_KEY = 'octoflow';
const DEFAULT_BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useStorage = ({
  autoSave = true,
  backupInterval = DEFAULT_BACKUP_INTERVAL
}: UseStorageConfig = {}): UseStorageResult => {
  const [state, setState] = useState<StorageState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastSaveAttempt = useRef<number>(Date.now());
  const backupTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial state
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState) as StorageState;
        setState(parsed);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load state');
      setError(error);
      trackError(error, { context: 'useStorage.init' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up periodic backup
  useEffect(() => {
    if (!autoSave) return;

    const backup = async () => {
      try {
        if (state) {
          const backupKey = `${STORAGE_KEY}_backup`;
          await sessionStorage.setItem(backupKey, JSON.stringify(state));
          lastSaveAttempt.current = Date.now();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Backup failed');
        trackError(error, { context: 'useStorage.backup' });
      }
    };

    backupTimeoutRef.current = setInterval(backup, backupInterval);

    return () => {
      if (backupTimeoutRef.current) {
        clearInterval(backupTimeoutRef.current);
      }
    };
  }, [autoSave, backupInterval, state]);

  const saveState = useCallback(async (newState: StorageState): Promise<boolean> => {
    try {
      // Merge with existing state to prevent data loss
      const merged = {
        ...state,
        ...newState,
        metadata: {
          ...state?.metadata,
          ...newState.metadata,
          lastSaved: new Date().toISOString()
        }
      };

      await sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      setState(merged);
      lastSaveAttempt.current = Date.now();
      setError(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save state');
      setError(error);
      trackError(error, { context: 'useStorage.save' });
      return false;
    }
  }, [state]);

  // Attempt to recover from backup if main storage fails
  const recoverFromBackup = useCallback(async (): Promise<boolean> => {
    try {
      const backupKey = `${STORAGE_KEY}_backup`;
      const backup = sessionStorage.getItem(backupKey);
      if (backup) {
        const recovered = JSON.parse(backup) as StorageState;
        await saveState(recovered);
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Recovery failed');
      trackError(error, { context: 'useStorage.recover' });
      return false;
    }
  }, [saveState]);

  return {
    state,
    saveState,
    isLoading,
    error,
    recoverFromBackup
  };
};