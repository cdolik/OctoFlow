import { useState, useEffect, useCallback } from 'react';
import { IndexedDBAdapter } from '../utils/storage/IndexedDBAdapter';
import type { AssessmentState } from '../types';
import type { ErrorContext } from '../types/errors';
import { trackError } from '../utils/analytics';
import { withErrorHandling, createErrorContext } from '../utils/errorHandling';

interface UseStorageResult {
  state: AssessmentState | null;
  saveState: (state: AssessmentState) => Promise<boolean>;
  clearState: () => Promise<void>;
  isSessionActive: boolean;
  timeUntilExpiration: number;
  error: Error | null;
}

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const storageAdapter = new IndexedDBAdapter();

const createStorageError = (action: string, message: string): ErrorContext => 
  createErrorContext('useStorage', action, message);

export function useStorage(): UseStorageResult {
  const [state, setState] = useState<AssessmentState | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [error, setError] = useState<Error | null>(null);

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      const result = await withErrorHandling(async () => {
        await storageAdapter.initialize();
        return storageAdapter.getState();
      });

      if (result.error) {
        setError(result.error);
        trackError(result.error, createStorageError(
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
          timeSpent: newState.metadata.timeSpent || 0,
          attemptCount: (newState.metadata.attemptCount || 0) + 1
        },
        progress: {
          questionIndex: newState.progress.questionIndex,
          totalQuestions: newState.progress.totalQuestions,
          isComplete: newState.progress.isComplete
        }
      };

      await storageAdapter.saveState(stateWithMeta);
      setState(stateWithMeta);
      return true;
    });

    if (result.error) {
      setError(result.error);
      trackError(result.error, createStorageError(
        'saveState',
        'Failed to save state'
      ));
      return false;
    }

    return true;
  }, []);

  // Clear state
  const clearState = useCallback(async () => {
    const result = await withErrorHandling(async () => {
      await storageAdapter.clearAll();
      setState(null);
    });

    if (result.error) {
      setError(result.error);
      trackError(result.error, createStorageError(
        'clearState',
        'Failed to clear state'
      ));
    }
  }, []);

  // Calculate session status
  const timeSinceLastActivity = Date.now() - lastActivity;
  const timeUntilExpiration = Math.max(0, SESSION_TIMEOUT - timeSinceLastActivity);
  const isSessionActive = timeUntilExpiration > 0;

  // Auto-save on session expiration
  useEffect(() => {
    if (!isSessionActive && state) {
      saveState(state);
    }
  }, [isSessionActive, state, saveState]);

  return {
    state,
    saveState,
    clearState,
    isSessionActive,
    timeUntilExpiration,
    error
  };
}