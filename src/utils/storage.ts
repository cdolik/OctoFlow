import { AssessmentState } from '../types';

const STORAGE_KEY = 'octoflow';
const BACKUP_KEY = 'octoflow_backup';
const CURRENT_VERSION = '1.1';

export const getAssessmentState = (): AssessmentState | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const backup = sessionStorage.getItem(BACKUP_KEY);
      return backup ? JSON.parse(backup) : null;
    }
    const state = JSON.parse(stored);
    if (!validateState(state)) {
      throw new Error('Invalid state format');
    }
    return state;
  } catch {
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
    // Create backup before saving
    const currentState = getAssessmentState();
    if (currentState) {
      sessionStorage.setItem(BACKUP_KEY, JSON.stringify(currentState));
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      version: CURRENT_VERSION
    }));
    
    return true;
  } catch {
    return false;
  }
};

export const backupState = async (): Promise<boolean> => {
  try {
    const current = sessionStorage.getItem(STORAGE_KEY);
    if (!current) return false;

    const state = JSON.parse(current);
    if (!validateState(state)) return false;

    sessionStorage.setItem(BACKUP_KEY, current);
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
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(BACKUP_KEY);
  } catch {
    // Ignore errors during cleanup
  }
};
