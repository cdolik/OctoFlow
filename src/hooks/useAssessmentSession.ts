import { useState, useCallback } from 'react';
import { AssessmentState } from '../types';
import { useStorage } from './useStorage';
import { useError } from '../contexts/ErrorContext';
import { trackAssessmentComplete, trackError } from '../utils/analytics';
import { createErrorContext } from '../utils/errorHandling';

export interface UseAssessmentSessionProps {
  initialData?: AssessmentState;
}

export interface AssessmentSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: string;
  error?: Error;
}

export function useAssessmentSession(props?: UseAssessmentSessionProps) {
  const [saveStatus, setSaveStatus] = useState<AssessmentSaveStatus>({ 
    status: 'idle' 
  });
  const { state, saveState, isLoading, error } = useStorage();
  const { handleError } = useError();

  const saveResponse = useCallback(async (
    questionId: number,
    value: number,
    timeSpent: number
  ): Promise<boolean> => {
    if (!state) return false;

    try {
      setSaveStatus({ status: 'saving' });
      const newState: AssessmentState = {
        ...state,
        responses: {
          ...state.responses,
          [questionId]: value
        },
        metadata: {
          ...state.metadata,
          lastSaved: new Date().toISOString(),
          timeSpent: state.metadata.timeSpent + timeSpent,
          lastInteraction: Date.now()
        }
      };

      const success = await saveState(newState);
      setSaveStatus({
        status: success ? 'saved' : 'error',
        lastSaved: success ? new Date().toISOString() : undefined
      });

      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save response');
      setSaveStatus({ status: 'error', error });
      trackError(error, createErrorContext('useAssessmentSession', 'saveResponse', 'Failed to save response'));
      handleError(error);
      return false;
    }
  }, [state, saveState, handleError]);

  const completeSession = useCallback(async (): Promise<boolean> => {
    if (!state) return false;

    try {
      // Mark session as complete in state
      const newState: AssessmentState = {
        ...state,
        progress: {
          ...state.progress,
          isComplete: true,
          lastUpdated: new Date().toISOString()
        },
        metadata: {
          ...state.metadata,
          lastSaved: new Date().toISOString(),
          lastInteraction: Date.now()
        }
      };

      const success = await saveState(newState);
      if (success) {
        trackAssessmentComplete(state.currentStage!, newState);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to complete session');
      trackError(error, createErrorContext('useAssessmentSession', 'completeSession', 'Failed to complete session'));
      handleError(error);
      return false;
    }
  }, [state, saveState, handleError]);

  return {
    state,
    saveStatus,
    isLoading,
    error,
    saveResponse,
    completeSession
  };
}
