// Utility functions for managing assessment data in session storage

const STORAGE_KEY = 'octoflow';

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

// Storage utilities with score persistence
export const saveAssessmentResponse = (questionId, value) => {
  const existing = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  const updatedResponses = {
    ...existing,
    responses: {
      ...(existing.responses || {}),
      [questionId]: value
    }
  };
  sessionStorage.setItem('octoflow', JSON.stringify(updatedResponses));
};

export const saveScores = (scores) => {
  const existing = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  sessionStorage.setItem('octoflow', JSON.stringify({
    ...existing,
    scores
  }));
};

export const getAssessmentResponses = () => {
  const data = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  return data.responses || {};
};

export const getStoredScores = () => {
  const data = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  return data.scores;
};

export const clearAssessment = () => {
  sessionStorage.removeItem('octoflow');
};

export const getProgress = () => {
  const data = getAssessmentData();
  return Object.keys(data).length;
};