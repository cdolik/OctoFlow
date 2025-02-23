import { useState, useCallback, useEffect } from 'react';
import { Stage } from '../types';
import { 
  AssessmentState, 
  AssessmentResponse, 
  AssessmentSaveStatus,
  AssessmentValidation 
} from '../types/assessment';
import { useStorage } from './useStorage';
import { validateQuestionResponses } from '../utils/questionFiltering';
import { questions } from '../data/questions';
import { trackError, trackAssessmentComplete } from '../utils/analytics';

interface UseAssessmentSessionProps {
  initialStage?: Stage;
  autoSaveInterval?: number;
  onValidationError?: (error: string) => void;
}

export const useAssessmentSession = ({
  initialStage,
  autoSaveInterval = 5000,
  onValidationError
}: UseAssessmentSessionProps = {}) => {
  const [saveStatus, setSaveStatus] = useState<AssessmentSaveStatus>({ 
    status: 'saved', 
    timestamp: Date.now() 
  });

  const { 
    state, 
    saveState, 
    isLoading,
    error: storageError,
    recoverFromBackup 
  } = useStorage({
    autoSave: true,
    backupInterval: autoSaveInterval
  });

  const validateSession = useCallback(async (
    currentState: AssessmentState
  ): Promise<AssessmentValidation> => {
    try {
      const validation = await validateQuestionResponses(
        currentState.responses,
        questions,
        currentState.stage
      );

      return {
        isValid: validation.isValid,
        errors: validation.error ? [validation.error] : [],
        warnings: [],
        missingRequired: validation.details || [],
        invalidScores: []
      };
    } catch (error) {
      trackError(error instanceof Error ? error : new Error('Validation failed'));
      return {
        isValid: false,
        errors: ['Session validation failed'],
        warnings: [],
        missingRequired: [],
        invalidScores: []
      };
    }
  }, []);

  const saveResponse = useCallback(async (
    questionId: string,
    value: number,
    timeSpent: number
  ): Promise<boolean> => {
    if (!state) return false;

    try {
      setSaveStatus({ status: 'saving' });

      const response: AssessmentResponse = {
        value,
        timestamp: Date.now(),
        questionId,
        category: questions.find(q => q.id === questionId)?.category || '',
        timeSpent
      };

      const newState: AssessmentState = {
        ...state,
        responses: {
          ...state.responses,
          [questionId]: response
        },
        metadata: {
          ...state.metadata,
          lastInteraction: Date.now()
        }
      };

      const success = await saveState(newState);
      
      setSaveStatus({ 
        status: success ? 'saved' : 'error',
        ...(success ? { timestamp: Date.now() } : { error: new Error('Save failed') })
      });

      return success;
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Save failed');
      setSaveStatus({ status: 'error', error: saveError });
      trackError(saveError);
      return false;
    }
  }, [state, saveState]);

  const completeSession = useCallback(async (): Promise<boolean> => {
    if (!state) return false;

    try {
      const validation = await validateSession(state);
      if (!validation.isValid) {
        onValidationError?.(validation.errors.join(', '));
        return false;
      }

      trackAssessmentComplete(state.responses, state.stage);
      return true;
    } catch (error) {
      trackError(error instanceof Error ? error : new Error('Session completion failed'));
      return false;
    }
  }, [state, validateSession, onValidationError]);

  useEffect(() => {
    if (initialStage && !state) {
      saveState({
        stage: initialStage,
        responses: {},
        progress: {
          questionIndex: 0,
          totalQuestions: questions.filter(q => q.stages.includes(initialStage)).length,
          isComplete: false,
          lastUpdated: new Date().toISOString()
        },
        metadata: {
          startTime: Date.now(),
          lastInteraction: Date.now(),
          completedCategories: [],
          categoryScores: {}
        }
      });
    }
  }, [initialStage, state, saveState]);

  return {
    state,
    saveStatus,
    isLoading,
    error: storageError,
    saveResponse,
    completeSession,
    recoverFromBackup
  };
};