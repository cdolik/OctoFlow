import { useState, useEffect, useCallback } from 'react';
import { Stage } from '../types';
import { validateStageProgression } from '../utils/flowState';
import { saveAssessmentResponses } from '../utils/storage';
import { trackStageTransition, trackError } from '../utils/analytics';

interface UseStageTransitionProps {
  currentStage: Stage;
  responses: Record<string, number>;
  onTransitionComplete?: (stage: Stage) => void;
  onTransitionError?: (error: Error) => void;
}

interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  error: Error | null;
  fromStage?: Stage;
  toStage?: Stage;
}

export const useStageTransition = ({ 
  currentStage, 
  responses, 
  onTransitionComplete,
  onTransitionError 
}: UseStageTransitionProps) => {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    progress: 0,
    error: null
  });

  const startTransition = useCallback(async (targetStage: Stage) => {
    try {
      const validationResult = validateStageProgression(currentStage, targetStage);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      setTransitionState({
        isTransitioning: true,
        progress: 0,
        error: null,
        fromStage: currentStage,
        toStage: targetStage
      });

      // Ensure responses are saved before transition
      await saveAssessmentResponses(responses);
      trackStageTransition(currentStage, targetStage);
      return true;
    } catch (error) {
      const transitionError = error instanceof Error ? error : new Error('Transition failed');
      setTransitionState(prev => ({ ...prev, error: transitionError }));
      onTransitionError?.(transitionError);
      trackError(transitionError);
      return false;
    }
  }, [currentStage, responses, onTransitionError]);

  useEffect(() => {
    if (transitionState.isTransitioning && transitionState.toStage) {
      const timer = setInterval(() => {
        setTransitionState(prev => {
          const newProgress = Math.min(prev.progress + 0.1, 1);
          if (newProgress >= 1 && prev.toStage) {
            clearInterval(timer);
            onTransitionComplete?.(prev.toStage);
            return { 
              isTransitioning: false, 
              progress: 0,
              error: null 
            };
          }
          return { ...prev, progress: newProgress };
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [transitionState.isTransitioning, transitionState.toStage, onTransitionComplete]);

  const cancelTransition = useCallback(() => {
    setTransitionState({ 
      isTransitioning: false, 
      progress: 0,
      error: null 
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && transitionState.isTransitioning) {
        cancelTransition();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [transitionState.isTransitioning, cancelTransition]);

  return {
    ...transitionState,
    startTransition,
    cancelTransition
  };
};
