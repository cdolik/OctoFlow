import { useState, useEffect, useCallback } from 'react';
import { Stage } from '../types';
import { validateStageProgression } from '../utils/flowState';
import { saveAssessmentResponses } from '../utils/storage';
import { trackStageTransition } from '../utils/analytics';

interface UseStageTransitionProps {
  currentStage: Stage;
  responses: Record<string, number>;
  onTransitionComplete?: (stage: Stage) => void;
}

interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  fromStage?: Stage;
  toStage?: Stage;
}

export const useStageTransition = ({ 
  currentStage, 
  responses, 
  onTransitionComplete 
}: UseStageTransitionProps) => {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    progress: 0
  });

  const startTransition = useCallback((targetStage: Stage) => {
    if (!validateStageProgression(currentStage, targetStage)) {
      return false;
    }

    setTransitionState({
      isTransitioning: true,
      progress: 0,
      fromStage: currentStage,
      toStage: targetStage
    });

    saveAssessmentResponses(responses);
    trackStageTransition(currentStage, targetStage);
    return true;
  }, [currentStage, responses]);

  useEffect(() => {
    if (transitionState.isTransitioning && transitionState.toStage) {
      const timer = setInterval(() => {
        setTransitionState(prev => {
          const newProgress = Math.min(prev.progress + 0.1, 1);
          if (newProgress >= 1 && prev.toStage) {
            clearInterval(timer);
            onTransitionComplete?.(prev.toStage);
            return { isTransitioning: false, progress: 0 };
          }
          return { ...prev, progress: newProgress };
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [transitionState.isTransitioning, transitionState.toStage, onTransitionComplete]);

  const cancelTransition = useCallback(() => {
    setTransitionState({ isTransitioning: false, progress: 0 });
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