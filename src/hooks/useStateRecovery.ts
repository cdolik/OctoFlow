import { useState, useEffect, useCallback } from 'react';
import { Stage } from '../types';
import { getAssessmentData } from '../utils/storage';
import { validateStageProgress } from '../utils/flowState';

interface UseStateRecoveryResult {
  isRecovering: boolean;
  recoveredStage: Stage | null;
  recoveredResponses: Record<string, number>;
  error: Error | null;
  attemptRecovery: () => Promise<boolean>;
  clearRecoveredState: () => void;
}

export const useStateRecovery = (): UseStateRecoveryResult => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveredStage, setRecoveredStage] = useState<Stage | null>(null);
  const [recoveredResponses, setRecoveredResponses] = useState<Record<string, number>>({});
  const [error, setError] = useState<Error | null>(null);

  const attemptRecovery = useCallback(async (): Promise<boolean> => {
    setIsRecovering(true);
    setError(null);

    try {
      const state = getAssessmentData();
      
      if (!state.currentStage || !state.responses) {
        return false;
      }

      // Validate recovered state
      const isValid = validateStageProgress(state.responses, state.currentStage);
      if (!isValid) {
        throw new Error('Recovered state validation failed');
      }

      setRecoveredStage(state.currentStage);
      setRecoveredResponses(state.responses);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Recovery failed'));
      return false;
    } finally {
      setIsRecovering(false);
    }
  }, []);

  const clearRecoveredState = useCallback(() => {
    setRecoveredStage(null);
    setRecoveredResponses({});
    setError(null);
  }, []);

  useEffect(() => {
    // Attempt automatic recovery on mount
    attemptRecovery().catch(console.error);
  }, [attemptRecovery]);

  return {
    isRecovering,
    recoveredStage,
    recoveredResponses,
    error,
    attemptRecovery,
    clearRecoveredState
  };
};