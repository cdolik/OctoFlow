import { useState, useCallback, useEffect } from 'react';
import { Stage, StageValidationResult } from '../types';
import { validateStageSequence, getStageConfig } from '../data/StageConfig';
import { validateQuestionResponses } from '../utils/questionFiltering';
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

  const validateStage = useCallback(async (stage: Stage): Promise<boolean> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      // First validate stage sequence
      const isValidSequence = validateStageSequence(currentStage, stage);
      if (!isValidSequence) {
        throw new Error('Invalid stage progression. Please complete stages in order.');
      }

      // Then validate stage configuration
      const stageConfig = getStageConfig(stage);
      if (!stageConfig) {
        throw new Error('Invalid stage configuration');
      }

      // Finally validate responses if we have a current stage
      if (currentStage) {
        const responseValidation = validateQuestionResponses(
          responses, 
          questions,
          currentStage
        );

        if (!responseValidation.isValid) {
          throw new Error(responseValidation.error || 'Response validation failed');
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
      trackError(error instanceof Error ? error : new Error(errorMessage));
      
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