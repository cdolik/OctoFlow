import { Stage, AssessmentState } from '../types';
import { validateStageResponses } from './questionFilters';
import { questions } from '../data/questions';

const STORAGE_KEY = 'octoflow';
const STATE_VERSION = '1.1';

export const getAssessmentResponses = (): Record<string, number> | null => {
  try {
    const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return state.responses || null;
  } catch {
    return null;
  }
};

export const getAssessmentMetadata = (): { stage: Stage; lastSaved: string; questionCount: number } | null => {
  try {
    const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return state.metadata || null;
  } catch {
    return null;
  }
};

export const saveAssessmentResponses = (
  responses: Record<string, number>,
  stage: Stage
): boolean => {
  try {
    const stageQuestions = questions.filter(q => q.stages.includes(stage));
    const validation = validateStageResponses(responses, stageQuestions, stage);
    
    if (!validation.isValid) {
      console.warn('Invalid responses detected:', validation.error);
      // Still save but flag as incomplete
      const state = getAssessmentState();
      state.metadata.isComplete = false;
      state.responses = responses;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return false;
    }

    const state = getAssessmentState();
    state.responses = responses;
    state.metadata = {
      ...state.metadata,
      stage,
      lastSaved: new Date().toISOString(),
      questionCount: stageQuestions.length,
      isComplete: true
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error saving assessment responses:', error);
    return false;
  }
};

export const getAssessmentState = (): AssessmentState => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createInitialState();
    }
    
    const state = JSON.parse(stored);
    return {
      version: STATE_VERSION,
      responses: state.responses || {},
      currentStage: state.metadata?.stage || null,
      scores: state.scores || null,
      metadata: {
        lastSaved: state.metadata?.lastSaved || null,
        questionCount: state.metadata?.questionCount || 0,
        timeSpent: state.metadata?.timeSpent || 0,
        isComplete: state.metadata?.isComplete || false
      }
    };
  } catch {
    return createInitialState();
  }
};

const createInitialState = (): AssessmentState => ({
  version: STATE_VERSION,
  responses: {},
  currentStage: null,
  scores: null,
  metadata: {
    lastSaved: null,
    questionCount: 0,
    timeSpent: 0,
    isComplete: false
  }
});