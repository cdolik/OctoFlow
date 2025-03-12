import { StartupStage } from '../data/questions';
import { PersonalizationData } from '../components/PersonalizationInputs';

interface AssessmentHistoryItem {
  id: string;
  date: string;
  stage: StartupStage;
  scores: Record<string, number>;
  overallScore: number;
  personalizationData?: PersonalizationData;
}

const HISTORY_STORAGE_KEY = 'octoflow_assessment_history';

/**
 * Save assessment results to history
 */
export const saveAssessmentToHistory = (
  stage: StartupStage,
  responses: Record<string, number>,
  categoryScores: Record<string, number>,
  overallScore: number,
  personalizationData?: PersonalizationData
): void => {
  try {
    // Get existing history
    const existingHistory = getAssessmentHistory();
    
    // Create new history item
    const newHistoryItem: AssessmentHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      stage,
      scores: categoryScores,
      overallScore,
      personalizationData
    };
    
    // Add to history
    const updatedHistory = [newHistoryItem, ...existingHistory];
    
    // Save to localStorage
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving assessment to history:', error);
  }
};

/**
 * Get assessment history
 */
export const getAssessmentHistory = (): AssessmentHistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!historyJson) return [];
    
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error getting assessment history:', error);
    return [];
  }
};

/**
 * Clear assessment history
 */
export const clearAssessmentHistory = (): void => {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
};

/**
 * Get a specific assessment from history by ID
 */
export const getAssessmentById = (id: string): AssessmentHistoryItem | null => {
  try {
    const history = getAssessmentHistory();
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Error getting assessment by ID:', error);
    return null;
  }
};

/**
 * Delete a specific assessment from history by ID
 */
export const deleteAssessmentById = (id: string): void => {
  try {
    const history = getAssessmentHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting assessment:', error);
  }
}; 