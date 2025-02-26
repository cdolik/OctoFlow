const STORAGE_KEY = 'octoflow';
const STATE_VERSION = '1.1'; // Increment version for schema changes

// Schema definitions for different versions
const SCHEMA_VERSIONS = {
  '1.0': {
    responses: {},
    scores: null,
    metadata: {
      lastSaved: null,
      questionCount: 0
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

const validateSchema = (state, version) => {
  const schema = SCHEMA_VERSIONS[version];
  if (!schema) return SCHEMA_VERSIONS[STATE_VERSION];

  // Deep merge with default schema
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
  };
};

const validateResponses = (responses) => {
  if (!responses || typeof responses !== 'object') return {};
  return responses;
};

const migrateState = (oldState) => {
  const currentVersion = oldState.version || '1.0';
  
  // Migration paths
  const migrations = {
    '1.0': (state) => ({
      ...SCHEMA_VERSIONS['1.1'],
      responses: validateResponses(state.responses),
      scores: state.scores,
      currentStage: null,
      progress: {
        completed: [],
        lastAccessed: new Date().toISOString()
      },
      metadata: {
        ...state.metadata,
        timeSpent: 0,
        attemptCount: 1
      }
    })
  };

  // Apply migrations sequentially
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

export const getAssessmentData = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    console.error('Error reading assessment data:', e);
    return {};
  }
};

export const persistResponse = (questionId, value) => {
  try {
    const assessment = getAssessmentData();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...assessment,
      [questionId]: value
    }));
    return true;
  } catch (e) {
    console.error('Error saving response:', e);
    return false;
  }
};

export const saveAssessmentResponses = (responses) => {
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

export const getAssessmentResponses = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    
    const state = JSON.parse(saved);
    if (state.version !== STATE_VERSION) {
      const migrated = migrateState(state);
      // Save migrated state
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated.responses;
    }
    return validateResponses(state.responses);
  } catch (error) {
    console.error('Error retrieving assessment responses:', error);
    return {};
  }
};

export const clearAssessmentResponses = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing assessment responses:', error);
    return false;
  }
};

export const updateAssessmentResponse = (questionId, value) => {
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

export const saveScores = (scores) => {
  const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...existing,
    scores
  }));
};

export const getStoredScores = () => {
  const data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  return data.scores;
};

export const clearAssessment = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing assessment:', error);
    return false;
  }
};

export const getProgress = () => {
  const data = getAssessmentData();
  return Object.keys(data).length;
};

export const getAssessmentMetadata = () => {
  try {
    const data = getAssessmentData();
    if (!data.metadata) {
      return {
        stage: null,
        startTime: null,
        lastSaved: null,
        questionCount: 0
      };
    }
    return data.metadata;
  } catch (e) {
    console.error('Error reading assessment metadata:', e);
    return null;
  }
};

export const backupState = () => {
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

export const restoreFromBackup = () => {
  try {
    const backup = localStorage.getItem(`${STORAGE_KEY}_backup`);
    if (backup) {
      const state = JSON.parse(backup);
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