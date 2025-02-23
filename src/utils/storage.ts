import { Stage, AssessmentState, StorageState } from '../types';
import { validateStageResponses } from './questionFilters';
import { questions } from '../data/questions';

const STORAGE_KEY = 'octoflow';
const STATE_VERSION = '1.1';

export const getAssessmentResponses = (): Record<string, number> | null => {
  try {
    const state = getAssessmentData();
    return state.responses;
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

export const saveAssessmentResponses = async (
  responses: Record<string, number>
): Promise<boolean> => {
  try {
    const currentState = getAssessmentData();
    const newState = {
      ...currentState,
      responses,
      metadata: {
        ...currentState.metadata,
        lastSaved: new Date().toISOString()
      }
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    await createBackup(newState);
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

const createInitialState = (): StorageState => ({
  version: STATE_VERSION,
  responses: {},
  currentStage: null,
  metadata: {
    lastSaved: new Date().toISOString(),
    timeSpent: 0,
    attemptCount: 0
  }
});

const CURRENT_VERSION = '1.1';

export const getAssessmentData = (): StorageState => {
  try {
    const data = sessionStorage.getItem('octoflow');
    if (!data) return createInitialState();

    const state = JSON.parse(data);
    return migrateState(state);
  } catch {
    return createInitialState();
  }
};

const createBackup = async (state: StorageState): Promise<void> => {
  try {
    localStorage.setItem('octoflow_backup', JSON.stringify({
      ...state,
      metadata: {
        ...state.metadata,
        backupTime: Date.now()
      }
    }));
  } catch {
    // Backup creation failure is non-critical
  }
};

const migrateState = (oldState: StorageState | Record<string, unknown>): StorageState => {
  const currentVersion = (oldState as StorageState).version || '1.0';
  
  if (currentVersion === CURRENT_VERSION) {
    return oldState as StorageState;
  }

  // Migration paths
  const migrations: Record<string, (state: StorageState | Record<string, unknown>) => StorageState> = {
    '1.0': (state) => ({
      version: CURRENT_VERSION,
      currentStage: (state as any).currentStage || null,
      responses: (state as any).responses || {},
      metadata: {
        lastSaved: (state as any).metadata?.lastSaved || new Date().toISOString(),
        timeSpent: (state as any).metadata?.timeSpent || 0,
        attemptCount: ((state as any).metadata?.attemptCount || 0) + 1
      }
    })
  };

  const migration = migrations[currentVersion];
  return migration ? migration(oldState) : createInitialState();
};

export const clearAssessmentData = (): void => {
  sessionStorage.removeItem('octoflow');
  localStorage.removeItem('octoflow_backup');
};