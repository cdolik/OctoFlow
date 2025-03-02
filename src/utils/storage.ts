import { Stage } from '../types';

const STORAGE_KEY = 'octoflow-assessment';

/**
 * Saves the current assessment state to localStorage
 */
export const saveState = (state: {
  currentStage: Stage;
  responses: Record<string, { value: boolean; timestamp: number }>;
  scores?: Record<string, number>;
}): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

/**
 * Loads the assessment state from localStorage
 */
export const loadState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
};

/**
 * Clears the assessment state from localStorage
 */
export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state:', error);
  }
};