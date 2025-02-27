import { useState, useCallback } from 'react';
import { Stage, AssessmentState } from '../types';
import { useStorage } from './useStorage';
import { useStorageErrorHandler } from './useStorageErrorHandler';
import { useStageValidation } from './useStageValidation';
import { getStage } from '../data/stages';
import { trackError } from '../utils/analytics';

interface StageManagerOptions {
  onStageComplete?: (stage: Stage) => void;
  onStageError?: (error: Error) => void;
  autoSave?: boolean;
  backupInterval?: number;
}

export const useStageManager = (options: StageManagerOptions = {}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState<Error | null>(null);

  const {
    state,
    saveState,
    isLoading: storageLoading
  } = useStorage({
    autoSave: options.autoSave,
    backupInterval: options.backupInterval
  });

  const {
    isRecovering,
    handleStorageError
  } = useStorageErrorHandler({
    onRecoverySuccess: () => setTransitionError(null)
  });

  const { 
    error: validationError,
    revalidate 
  } = useStageValidation({
    currentStage: state?.currentStage ?? null,
    responses: state?.responses ?? {}
  });

  const transition = useCallback(async (targetStage: Stage) => {
    setIsTransitioning(true);
    setTransitionError(null);

    try {
      // Validate stage transition
      const isValid = await revalidate();
      if (!isValid) {
        throw new Error('Invalid stage transition');
      }

      const stageConfig = getStage(targetStage);
      if (!stageConfig) {
        throw new Error('Invalid stage configuration');
      }
      
      // Create new state with updated stage
      const newState: AssessmentState = {
        ...state,
        currentStage: targetStage,
        metadata: {
          lastSaved: new Date().toISOString(),
          lastTransition: new Date().toISOString(),
          stageStartTime: Date.now(),
          timeSpent: state?.metadata?.timeSpent ?? 0,
          attemptCount: state?.metadata?.attemptCount ?? 1
        },
        progress: {
          questionIndex: 0,
          totalQuestions: 0,
          isComplete: false
        }
      };

      // Attempt to save new state
      const saved = await saveState(newState);
      if (!saved) {
        throw new Error('Failed to save stage transition');
      }

      options.onStageComplete?.(targetStage);
    } catch (error) {
      const stageError = error instanceof Error ? error : new Error('Stage transition failed');
      setTransitionError(stageError);
      options.onStageError?.(stageError);

      // Attempt recovery if it's a storage error
      if (error instanceof Error && error.message.includes('storage')) {
        await handleStorageError(error);
      }

      trackError(stageError);
    } finally {
      setIsTransitioning(false);
    }
  }, [state, saveState, handleStorageError, revalidate, options]);

  return {
    currentStage: state?.currentStage,
    responses: state?.responses ?? {},
    progress: state?.progress,
    isTransitioning,
    isLoading: storageLoading || isRecovering,
    error: transitionError || validationError,
    transition
  };
};
