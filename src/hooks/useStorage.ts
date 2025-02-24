import { useState, useEffect, useCallback } from 'react';
import { IndexedDBAdapter } from '../utils/storage/IndexedDBAdapter';
import { StorageState, Stage } from '../types';

interface UseStorageResult {
  state: StorageState | null;
  saveState: (state: StorageState) => Promise<boolean>;
  clearState: () => Promise<void>;
  isSessionActive: boolean;
  timeUntilExpiration: number;
}

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const storageAdapter = new IndexedDBAdapter();

export function useStorage(): UseStorageResult {
  const [state, setState] = useState<StorageState | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      await storageAdapter.initialize();
      const savedState = await storageAdapter.getState('current');
      if (savedState) {
        setState(savedState);
      }
    };

    initStorage();
  }, []);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Save state
  const saveState = useCallback(async (newState: StorageState): Promise<boolean> => {
    try {
      // Add metadata
      const stateWithMeta = {
        ...newState,
        metadata: {
          ...newState.metadata,
          lastSaved: new Date().toISOString(),
          lastModified: Date.now()
        }
      };

      // Save to IndexedDB
      await storageAdapter.saveState({
        ...stateWithMeta,
        id: 'current'
      });

      // Update local state
      setState(stateWithMeta);

      // Create backup for completed stages
      if (newState.currentStage) {
        const stage = newState.currentStage as Stage;
        const isStageComplete = newState.stages?.[stage]?.isComplete;
        
        if (isStageComplete) {
          await storageAdapter.saveState({
            ...stateWithMeta,
            id: `backup_${stage}`
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }, []);

  // Clear state
  const clearState = useCallback(async () => {
    try {
      await storageAdapter.clearAll();
      setState(null);
    } catch (error) {
      console.error('Failed to clear state:', error);
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
    timeUntilExpiration
  };
}