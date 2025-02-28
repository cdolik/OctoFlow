import { useCallback, useState } from 'react';
import { useStorage } from './useStorage';
import { AssessmentState, Stage } from '../types';
import { trackStageTransition } from '../utils/analytics';

interface UseAssessmentResult {
  stage: Stage | null;
  responses: Record<string, number>;
  scores: Record<string, number>;
  saveResponse: (questionId: string, value: number) => Promise<boolean>;
  completeStage: (stage: Stage) => Promise<boolean>;
  calculateScore: (stage: Stage) => number;
}

export function useAssessment(): UseAssessmentResult {
  const { state, saveState } = useStorage();
  const [scores, setScores] = useState<Record<string, number>>({});

  const saveResponse = useCallback(async (questionId: string, value: number) => {
    if (!state) return false;

    const newState: AssessmentState = {
      ...state,
      responses: {
        ...state.responses,
        [questionId]: value
      },
      metadata: {
        ...state.metadata,
        lastSaved: new Date().toISOString(),
        timeSpent: state.metadata.timeSpent + Date.now() - new Date(state.metadata.lastSaved).getTime()
      }
    };

    return saveState(newState);
  }, [state, saveState]);

  const calculateScore = useCallback((stage: Stage): number => {
    if (!state?.responses) return 0;

    const stageResponses = Object.values(state.responses);
    if (stageResponses.length === 0) return 0;

    const sum = stageResponses.reduce((acc, val) => acc + val, 0);
    const avgScore = sum / stageResponses.length;
    const normalizedScore = (avgScore / 4) * 100; // Normalize to 0-100 scale

    setScores(prev => ({
      ...prev,
      [stage]: normalizedScore
    }));

    return normalizedScore;
  }, [state?.responses]);

  const completeStage = useCallback(async (stage: Stage): Promise<boolean> => {
    if (!state) return false;

    const score = calculateScore(stage);
    const newState: AssessmentState = {
      ...state,
      stages: {
        ...state.stages,
        [stage]: {
          isComplete: true,
          score
        }
      },
      metadata: {
        ...state.metadata,
        lastTransition: new Date().toISOString()
      }
    };

    const success = await saveState(newState);
    if (success) {
      trackStageTransition(stage, null);
    }
    return success;
  }, [state, saveState, calculateScore]);

  return {
    stage: state?.currentStage ?? null,
    responses: state?.responses ?? {},
    scores,
    saveResponse,
    completeStage,
    calculateScore
  };
}