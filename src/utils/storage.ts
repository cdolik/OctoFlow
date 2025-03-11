import { StartupStage, Category } from '../data/questions';

// Define types for historical data
export interface AssessmentResult {
  id: string;
  date: string;
  stage: StartupStage;
  responses: Record<string, number>;
  categoryScores: Record<Category, number>;
}

// Storage keys
const STORAGE_KEY_HISTORY = 'octoflow-assessment-history';
const STORAGE_KEY_SETTINGS = 'octoflow-settings';

// Default settings
const DEFAULT_SETTINGS = {
  historyLimit: 10,
  theme: 'light',
  autoSaveHistory: true
};

// Get user settings
export const getUserSettings = (): {
  historyLimit: number;
  theme: string;
  autoSaveHistory: boolean;
} => {
  try {
    const settingsJson = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!settingsJson) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save user settings
export const saveUserSettings = (settings: Partial<{
  historyLimit: number;
  theme: string;
  autoSaveHistory: boolean;
}>): void => {
  try {
    const currentSettings = getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to save user settings:', error);
  }
};

// Save assessment result to history
export const saveAssessmentToHistory = (
  stage: StartupStage,
  responses: Record<string, number>,
  categoryScores: Record<Category, number>
): void => {
  try {
    // Check if auto-save is enabled
    const { autoSaveHistory, historyLimit } = getUserSettings();
    if (!autoSaveHistory) {
      return;
    }
    
    // Get existing history
    const history = getAssessmentHistory();
    
    // Create new assessment result
    const newResult: AssessmentResult = {
      id: generateId(),
      date: new Date().toISOString(),
      stage,
      responses,
      categoryScores
    };
    
    // Add to history and save
    history.unshift(newResult); // Add to beginning of array
    
    // Limit history based on user settings
    if (history.length > historyLimit) {
      history.splice(historyLimit); // Remove excess items
    }
    
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save assessment to history:', error);
  }
};

// Get assessment history
export const getAssessmentHistory = (): AssessmentResult[] => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!historyJson) {
      return [];
    }
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Failed to get assessment history:', error);
    return [];
  }
};

// Delete assessment from history
export const deleteAssessmentFromHistory = (id: string): void => {
  try {
    const history = getAssessmentHistory();
    const updatedHistory = history.filter(result => result.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete assessment from history:', error);
  }
};

// Clear all assessment history
export const clearAssessmentHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch (error) {
    console.error('Failed to clear assessment history:', error);
  }
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 