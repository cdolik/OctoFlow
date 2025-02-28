import { AssessmentState } from '../types';
import { trackError } from './analytics';

const STORAGE_KEY = 'octoflow_assessment_state';
const VERSION = '1.0.0';

export const getAssessmentState = (): AssessmentState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;

    const state = JSON.parse(savedState) as AssessmentState;
    
    // Version check
    if (state.version !== VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load assessment state:', error);
    return null;
  }
};

// Add alias function for getAssessmentData to match what App.test.tsx expects
export const getAssessmentData = getAssessmentState;

export const getAssessmentResponses = (): Record<string, number> | null => {
  try {
    const state = getAssessmentState();
    return state?.responses || null;
  } catch {
    return null;
  }
};

export const getAssessmentMetadata = (): AssessmentState['metadata'] | null => {
  try {
    const state = getAssessmentState();
    return state?.metadata || null;
  } catch {
    return null;
  }
};

export const saveAssessmentResponses = async (
  responses: Record<string, number>
): Promise<boolean> => {
  try {
    const currentState = getAssessmentState();
    if (!currentState) {
      return false;
    }

    const newState: AssessmentState = {
      ...currentState,
      responses,
      metadata: {
        ...currentState.metadata,
        lastSaved: new Date().toISOString()
      }
    };

    return saveState(newState);
  } catch {
    return false;
  }
};

export const saveState = async (state: AssessmentState): Promise<boolean> => {
  try {
    const stateToSave = {
      ...state,
      version: VERSION,
      metadata: {
        ...state.metadata,
        lastSaved: new Date().toISOString()
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    return true;
  } catch (error) {
    console.error('Failed to save assessment state:', error);
    return false;
  }
};

export const backupState = async (): Promise<boolean> => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (!current) return false;

    const state = JSON.parse(current);
    if (!validateState(state)) return false;

    localStorage.setItem(BACKUP_KEY, current);
    return true;
  } catch {
    return false;
  }
};

export const restoreFromBackup = async (): Promise<boolean> => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return false;
    
    const state = JSON.parse(backup);
    if (!validateState(state)) return false;
    
    localStorage.setItem(STORAGE_KEY, backup);
    return true;
  } catch {
    return false;
  }
};

export const validateState = (state: unknown): state is AssessmentState => {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const typedState = state as Partial<AssessmentState>;

  return !!(
    typedState.version &&
    typedState.responses &&
    typedState.metadata?.lastSaved &&
    typeof typedState.metadata.timeSpent === 'number' &&
    typeof typedState.metadata.attemptCount === 'number'
  );
};

export const clearAssessmentState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
  } catch {
    // Ignore errors during cleanup
  }
};

export const saveMetricsAndRecommendations = async (
  metrics: { averageResponseTime: number; completionRate: number },
  recommendations: string[]
): Promise<boolean> => {
  try {
    const currentState = getAssessmentState();
    if (!currentState) {
      return false;
    }

    const newState: AssessmentState = {
      ...currentState,
      metadata: {
        ...currentState.metadata,
        lastSaved: new Date().toISOString(),
        metrics,
        recommendations
      }
    };

    return saveState(newState);
  } catch {
    return false;
  }
};

export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear assessment state:', error);
  }
};
