import { Stage } from '../types';

interface AssessmentMetadata {
  lastSaved: string | null;
  questionCount: number;
  timeSpent: number;
  attemptCount: number;
}

interface AssessmentProgress {
  completed: Stage[];
  lastAccessed: string | null;
}

export interface AssessmentState {
  version: SchemaVersion;
  responses: Record<string, number>;
  scores: Record<string, number> | null;
  currentStage: Stage | null;
  progress: AssessmentProgress;
  metadata: AssessmentMetadata;
}

type SchemaVersion = '1.0' | '1.1';

const STORAGE_KEY = 'octoflow';
const STATE_VERSION: SchemaVersion = '1.1';

const SCHEMA_VERSIONS: Record<SchemaVersion, Partial<AssessmentState>> = {
  '1.0': {
    responses: {},
    scores: null,
    metadata: {
      lastSaved: null,
      questionCount: 0,
      timeSpent: 0,
      attemptCount: 0
    }
  },
  '1.1': {
    version: '1.1',
    responses: {},
    scores: null,
    currentStage: null,
    progress: {
      completed: [],
      lastAccessed: null
    },
    metadata: {
      lastSaved: null,
      questionCount: 0,
      timeSpent: 0,
      attemptCount: 0
    }
  }
};

const validateSchema = (state: Partial<AssessmentState>, version: SchemaVersion): AssessmentState => {
  const schema = SCHEMA_VERSIONS[version];
  if (!schema) return SCHEMA_VERSIONS[STATE_VERSION] as AssessmentState;
  
  return {
    ...schema,
    ...state,
    metadata: {
      ...schema.metadata,
      ...state.metadata,
      timeSpent: state.metadata?.timeSpent ?? 0
    },
    progress: {
      ...schema.progress,
      ...(state.progress || {})
    }
  } as AssessmentState;
};

const validateResponses = (responses: unknown): Record<string, number> => {
  if (!responses || typeof responses !== 'object') return {};
  return responses as Record<string, number>;
};

const migrateState = (oldState: Partial<AssessmentState>): AssessmentState => {
  const currentVersion = (oldState.version || '1.0') as SchemaVersion;
  
  const migrations: Record<SchemaVersion, (state: Partial<AssessmentState>) => AssessmentState> = {
    '1.0': (state) => ({
      ...SCHEMA_VERSIONS['1.1'],
      version: '1.1',
      responses: validateResponses(state.responses),
      scores: state.scores,
      currentStage: null,
      progress: {
        completed: [],
        lastAccessed: new Date().toISOString()
      },
      metadata: {
        lastSaved: state.metadata?.lastSaved ?? null,
        questionCount: state.metadata?.questionCount ?? 0,
        timeSpent: state.metadata?.timeSpent ?? 0,
        attemptCount: state.metadata?.attemptCount ?? 1
      }
    } as AssessmentState),
    '1.1': (state) => validateSchema(state, '1.1')
  };

  let migratedState = { ...oldState };
  const versions = Object.keys(SCHEMA_VERSIONS) as SchemaVersion[];
  const startIdx = versions.indexOf(currentVersion as SchemaVersion);
  
  for (let i = startIdx; i < versions.length - 1; i++) {
    const fromVersion = versions[i];
    if (migrations[fromVersion]) {
      migratedState = migrations[fromVersion](migratedState);
    }
  }
  
  return validateSchema(migratedState, STATE_VERSION);
};

export const getAssessmentData = (): Partial<AssessmentState> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    console.error('Error reading assessment data:', e);
    return {};
  }
};

export const persistResponse = (questionId: string, value: number): boolean => {
  try {
    const assessment = getAssessmentData();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...assessment,
      responses: {
        ...(assessment.responses || {}),
        [questionId]: value
      }
    }));
    return true;
  } catch (e) {
    console.error('Error saving response:', e);
    return false;
  }
};

export const saveAssessmentResponses = (responses: Record<string, number>): boolean => {
  try {
    const currentState = getAssessmentData();
    const state = validateSchema({
      ...currentState,
      version: STATE_VERSION,
      responses: validateResponses(responses),
      metadata: {
        ...(currentState.metadata || {}),
        lastSaved: new Date().toISOString(),
        questionCount: Object.keys(responses).length,
        attemptCount: (currentState.metadata?.attemptCount || 0) + 1
      }
    }, STATE_VERSION);
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error saving assessment responses:', error);
    return false;
  }
};

export const getAssessmentResponses = (): Record<string, number> => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    
    const state = JSON.parse(saved) as Partial<AssessmentState>;
    if (state.version !== STATE_VERSION) {
      const migrated = migrateState(state);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated.responses;
    }
    return validateResponses(state.responses);
  } catch (error) {
    console.error('Error retrieving assessment responses:', error);
    return {};
  }
};

export const clearAssessmentResponses = (): boolean => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing assessment responses:', error);
    return false;
  }
};

export const updateAssessmentResponse = (questionId: string, value: number): boolean => {
  try {
    const current = getAssessmentResponses();
    const updated = {
      ...current,
      [questionId]: value
    };
    return saveAssessmentResponses(updated);
  } catch (error) {
    console.error('Error updating assessment response:', error);
    return false;
  }
};

export const saveScores = (scores: Record<string, number>): void => {
  const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...existing,
    scores
  }));
};

export const getStoredScores = (): Record<string, number> | null => {
  const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Partial<AssessmentState>;
  return data.scores || null;
};

export const clearAssessment = (): boolean => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing assessment:', error);
    return false;
  }
};

export const getProgress = (): number => {
  const data = getAssessmentData();
  return Object.keys(data.responses || {}).length;
};

export const getAssessmentMetadata = (): AssessmentMetadata | null => {
  try {
    const data = getAssessmentData();
    if (!data.metadata) {
      return {
        lastSaved: null,
        questionCount: 0,
        timeSpent: 0,
        attemptCount: 0
      };
    }
    return data.metadata as AssessmentMetadata;
  } catch (e) {
    console.error('Error reading assessment metadata:', e);
    return null;
  }
};

export const backupState = (): boolean => {
  try {
    const state = sessionStorage.getItem(STORAGE_KEY);
    if (state) {
      localStorage.setItem(`${STORAGE_KEY}_backup`, state);
      localStorage.setItem(`${STORAGE_KEY}_backup_time`, new Date().toISOString());
    }
    return true;
  } catch (error) {
    console.error('Error backing up state:', error);
    return false;
  }
};

export const restoreFromBackup = (): boolean => {
  try {
    const backup = localStorage.getItem(`${STORAGE_KEY}_backup`);
    if (backup) {
      const state = JSON.parse(backup) as Partial<AssessmentState>;
      const migrated = migrateState(state);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
};