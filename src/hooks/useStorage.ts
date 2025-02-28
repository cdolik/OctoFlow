import { useState, useCallback, useEffect } from 'react';
import { AssessmentState } from '../types';
import { getAssessmentState, saveState } from '../utils/storage';
import { trackError } from '../utils/analytics';

interface UseStorageResult {
  state: AssessmentState | null;
  saveState: (state: AssessmentState) => Promise<boolean>;
  error: Error | null;
}

export function useStorage(): UseStorageResult {
  const [state, setState] = useState<AssessmentState | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Load initial state
  useEffect(() => {
    const initialState = getAssessmentState();
    setState(initialState);
  }, []);

  // Save state with error handling
  const handleSaveState = useCallback(async (newState: AssessmentState): Promise<boolean> => {
    try {
      const success = await saveState(newState);
      if (success) {
        setState(newState);
        setError(null);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save state');
      setError(error);
      trackError(error, {
        component: 'useStorage',
        action: 'saveState',
        message: 'Failed to save state'
      });
      return false;
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!state) return;

    const autoSaveInterval = setInterval(() => {
      handleSaveState(state).catch(console.error);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [state, handleSaveState]);

  return {
    state,
    saveState: handleSaveState,
    error
  };
}
