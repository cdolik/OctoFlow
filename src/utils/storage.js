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

export const clearAssessment = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

export const getProgress = () => {
  const data = getAssessmentData();
  return Object.keys(data).length;
};