const STORAGE_KEY = 'octoflow';
const STATE_VERSION = '1.0';

const validateResponses = (responses) => {
  if (!responses || typeof responses !== 'object') return {};
  return responses;
};

const migrateState = (oldState) => {
  // Handle future state migrations here
  // For now, just validate the responses
  return {
    ...oldState,
    responses: validateResponses(oldState.responses)
  };
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
    const state = {
      version: STATE_VERSION,
      responses: validateResponses(responses),
      timestamp: Date.now(),
      metadata: {
        lastSaved: new Date().toISOString(),
        questionCount: Object.keys(responses).length
      }
    };
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
      return migrateState(state).responses;
    }
    return validateResponses(state.responses);
  } catch (error) {
    console.error('Error retrieving assessment responses:', error);
    // Attempt to recover partial state
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
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
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    return state.metadata;
  } catch (error) {
    return null;
  }
};