import { useState, useCallback, useEffect } from 'react';
import { AssessmentState } from '../types';
import { storageAdapter } from '../utils/storage/adapter';
import { trackError } from '../utils/analytics';
import { createErrorContext } from '../utils/errorHandling';
import { withErrorHandling } from '../utils/errorHandling';

export interface UseStorageResult {
  state: AssessmentState | null;
  saveState: (state: AssessmentState) => Promise<boolean>;
  clearState: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useStorage(): UseStorageResult {
  const [state, setState] = useState<AssessmentState | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      const result = await withErrorHandling(async () => {
        await storageAdapter.initialize();
        return storageAdapter.getState();
      });

      setIsLoading(false);

      if (result.error) {
        setError(result.error);
        trackError(result.error, createErrorContext(
          'useStorage',
          'initialize',
          'Storage initialization failed'
        ));
      } else if (result.data) {
        setState(result.data as AssessmentState);
      }
    };

    initStorage();
  }, []);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    return () => events.forEach(event => window.removeEventListener(event, updateActivity));
  }, []);

  // Save state
  const saveState = useCallback(async (newState: AssessmentState): Promise<boolean> => {
    const result = await withErrorHandling(async () => {
      const currentTime = new Date().toISOString();
      const stateWithMeta: AssessmentState = {
        ...newState,
        metadata: {
          ...newState.metadata,
          lastSaved: currentTime,
          lastInteraction: Date.now()
        }
      };

      await storageAdapter.saveState(stateWithMeta);
      setState(stateWithMeta);
      return true;
    });

    if (result.error) {
      setError(result.error);
      trackError(result.error, createErrorContext(
        'useStorage',
        'saveState',
        'Failed to save state'
      ));
      return false;
    }

    return result.data || false;
  }, []);

  const clearState = useCallback(async (): Promise<void> => {
    try {
      await storageAdapter.clearState();
      setState(null);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear state');
      setError(error);
      trackError(error, createErrorContext(
        'useStorage', 
        'clearState',
        'Failed to clear state'
      ));
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (state) {
        saveState(state);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [state, saveState]);

  return {
    state,
    saveState,
    clearState,
    isLoading,
    error
  };
}
