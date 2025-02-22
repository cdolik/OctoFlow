import { Stage } from '../types';

export interface AssessmentMetadata {
  stage: Stage | null;
  startTime: number | null;
  lastSaved: number | null;
  questionCount: number;
  version: string;
  attemptCount: number;
  timeSpent: number;
}

export interface AssessmentProgress {
  completed: string[];
  lastAccessed: string | null;
}

export interface AssessmentState {
  version: string;
  responses: Record<string, number>;
  scores: Record<string, number> | null;
  currentStage: Stage | null;
  progress: AssessmentProgress;
  metadata: AssessmentMetadata;
}

const STORAGE_KEY = 'octoflow';
const STATE_VERSION = '1.1';

const SCHEMA_VERSIONS: Record<string, Partial<AssessmentState>> = {
  '1.0': {
    responses: {},
    scores: null,
    metadata: {
      lastSaved: null,
      questionCount: 0,
      version: '1.0',
      startTime: null,
      stage: null,
      attemptCount: 0,
      timeSpent: 0
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
      version: '1.1',
      startTime: Date.now(),
      stage: null,
      attemptCount: 0,
      timeSpent: 0
    }
  }
};

const validateSchema = (state: Partial<AssessmentState>, version: string): AssessmentState => {
  const schema = SCHEMA_VERSIONS[version] as AssessmentState;
  if (!schema) return SCHEMA_VERSIONS[STATE_VERSION] as AssessmentState;

  return {
    ...schema,
    ...state,
    metadata: {
      ...schema.metadata,
      ...state.metadata
    },
    progress: {
      ...schema.progress,
      ...(state.progress || {})
    }
  } as AssessmentState;
};

const migrateState = (oldState: Partial<AssessmentState>): AssessmentState => {
  const currentVersion = oldState.version || '1.0';
  
  const migrations: Record<string, (state: Partial<AssessmentState>) => AssessmentState> = {
    '1.0': (state) => ({
      ...SCHEMA_VERSIONS['1.1'],
      responses: state.responses || {},
      scores: state.scores,
      currentStage: null,
      progress: {
        completed: [],
        lastAccessed: new Date().toISOString()
      },
      metadata: {
        ...(state.metadata || SCHEMA_VERSIONS['1.1'].metadata),
        timeSpent: 0,
        attemptCount: 1,
        version: '1.1'
      }
    } as AssessmentState)
  };

  let migratedState = { ...oldState };
  const versions = Object.keys(SCHEMA_VERSIONS);
  const startIdx = versions.indexOf(currentVersion);

  for (let i = startIdx; i < versions.length - 1; i++) {
    const fromVersion = versions[i];
    if (migrations[fromVersion]) {
      migratedState = migrations[fromVersion](migratedState);
    }
  }

  return validateSchema(migratedState, STATE_VERSION);
};

export const getAssessmentData = (): AssessmentState => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return SCHEMA_VERSIONS[STATE_VERSION] as AssessmentState;
    
    const state = JSON.parse(saved);
    if (state.version !== STATE_VERSION) {
      const migrated = migrateState(state);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return validateSchema(state, STATE_VERSION);
  } catch (e) {
    console.error('Error reading assessment data:', e);
    return SCHEMA_VERSIONS[STATE_VERSION] as AssessmentState;
  }
};

export const getAssessmentMetadata = (): AssessmentMetadata | null => {
  try {
    const data = getAssessmentData();
    if (!data.metadata) {
      return {
        stage: null,
        startTime: null,
        lastSaved: null,
        questionCount: 0,
        version: STATE_VERSION,
        attemptCount: 0,
        timeSpent: 0
      };
    }
    return data.metadata;
  } catch (e) {
    console.error('Error reading assessment metadata:', e);
    return null;
  }
};

export const getAssessmentResponses = (): Record<string, number> => {
  const data = getAssessmentData();
  return data.responses || {};
};

export const saveAssessmentResponses = (responses: Record<string, number>): void => {
  try {
    const currentData = getAssessmentData();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...currentData,
      responses,
      metadata: {
        ...(currentData.metadata || {}),
        lastSaved: Date.now()
      }
    }));
  } catch (e) {
    console.error('Error saving responses:', e);
  }
};