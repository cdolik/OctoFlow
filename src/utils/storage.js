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

// Storage utilities for persisting assessment responses
export const saveAssessmentResponses = (responses) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    return true;
  } catch (error) {
    console.error('Error saving assessment responses:', error);
    return false;
  }
};

export const getAssessmentResponses = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
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
  const existing = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  sessionStorage.setItem('octoflow', JSON.stringify({
    ...existing,
    scores
  }));
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