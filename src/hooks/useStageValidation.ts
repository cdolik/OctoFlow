import { useState, useCallback, useEffect } from 'react';
import { Stage, StageValidationResult } from '../types';
import { validateStageProgression, validateStageTransition } from '../utils/stageValidation';
import { getStageQuestions } from '../utils/questionFilters';
import { questions } from '../data/questions';
import { trackError } from '../utils/analytics';

interface UseStageValidationProps {
  currentStage: Stage | null;
  targetStage?: Stage;
  responses: Record<string, number>;
  onValidationError?: (error: string) => void;
}

interface ValidationState {
  isValidating: boolean;
  error: string | null;
  canProgress: boolean;
}

export const useStageValidation = ({
  currentStage,
  targetStage,
  responses,
  onValidationError
}: UseStageValidationProps) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    error: null,
    canProgress: true
  });

  const validateStage = useCallback(async (stage: Stage) => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const stageQuestions = getStageQuestions(stage, questions);
      
      // First validate progression
      const progressionResult = validateStageProgression(currentStage, stage);
      if (!progressionResult.isValid) {
        throw new Error(progressionResult.error);
      }

      // Then validate transition if we have a current stage
      if (currentStage) {
        const transitionResult = validateStageTransition(
          currentStage,
          stage,
          stageQuestions,
          responses
        );

        if (!transitionResult.isValid) {
          throw new Error(transitionResult.error);
        }
      }

      setValidationState({
        isValidating: false,
        error: null,
        canProgress: true
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      
      setValidationState({
        isValidating: false,
        error: errorMessage,
        canProgress: false
      });

      onValidationError?.(errorMessage);
      trackError('stage_validation_error', { error: errorMessage, stage });
      
      return false;
    }
  }, [currentStage, responses, onValidationError]);

  useEffect(() => {
    if (targetStage) {
      validateStage(targetStage);
    }
  }, [targetStage, validateStage]);

  const revalidate = useCallback(() => {
    if (targetStage) {
      return validateStage(targetStage);
    }
    return Promise.resolve(true);
  }, [targetStage, validateStage]);

  return {
    ...validationState,
    revalidate
  };
};