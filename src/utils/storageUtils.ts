import { StartupStage } from '../data/questions';
import { PersonalizationData } from '../components/PersonalizationInputs';

// Keys for storage
const STORAGE_KEYS = {
  CURRENT_STAGE: 'octoflow_current_stage',
  STAGE_RESPONSES: 'octoflow_stage_responses',
  PERSONALIZATION: 'octoflow_personalization',
  ASSESSMENT_HISTORY: 'octoflow_assessment_history',
  CURRENT_VIEW: 'octoflow_current_view',
};

// Storage types
export type StorageType = 'session' | 'local';

/**
 * Saves the current assessment stage to storage
 */
export const saveCurrentStage = (stage: StartupStage, storageType: StorageType = 'session'): void => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  storage.setItem(STORAGE_KEYS.CURRENT_STAGE, stage);
};

/**
 * Gets the current assessment stage from storage
 */
export const getCurrentStage = (storageType: StorageType = 'session'): StartupStage | null => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  const stage = storage.getItem(STORAGE_KEYS.CURRENT_STAGE) as StartupStage | null;
  return stage;
};

/**
 * Saves the responses for a specific stage to storage
 */
export const saveStageResponses = (
  stage: StartupStage, 
  responses: Record<string, number>,
  storageType: StorageType = 'session'
): void => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  
  // Get existing responses for all stages
  const existingResponsesStr = storage.getItem(STORAGE_KEYS.STAGE_RESPONSES);
  const existingResponses = existingResponsesStr 
    ? JSON.parse(existingResponsesStr) 
    : {} as Record<StartupStage, Record<string, number>>;
  
  // Update responses for the current stage
  existingResponses[stage] = responses;
  
  // Save back to storage
  storage.setItem(STORAGE_KEYS.STAGE_RESPONSES, JSON.stringify(existingResponses));
};

/**
 * Gets all stage responses from storage
 */
export const getAllStageResponses = (
  storageType: StorageType = 'session'
): Record<StartupStage, Record<string, number>> => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  const responsesStr = storage.getItem(STORAGE_KEYS.STAGE_RESPONSES);
  return responsesStr 
    ? JSON.parse(responsesStr) 
    : {} as Record<StartupStage, Record<string, number>>;
};

/**
 * Saves personalization data to storage
 */
export const savePersonalizationData = (
  data: PersonalizationData,
  storageType: StorageType = 'session'
): void => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  storage.setItem(STORAGE_KEYS.PERSONALIZATION, JSON.stringify(data));
};

/**
 * Gets personalization data from storage
 */
export const getPersonalizationData = (
  storageType: StorageType = 'session'
): PersonalizationData | undefined => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  const dataStr = storage.getItem(STORAGE_KEYS.PERSONALIZATION);
  return dataStr ? JSON.parse(dataStr) : undefined;
};

/**
 * Saves the current view (assessment, results, etc.) to storage
 */
export const saveCurrentView = (view: string, storageType: StorageType = 'session'): void => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  storage.setItem(STORAGE_KEYS.CURRENT_VIEW, view);
};

/**
 * Gets the current view from storage
 */
export const getCurrentView = (storageType: StorageType = 'session'): string | null => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  return storage.getItem(STORAGE_KEYS.CURRENT_VIEW);
};

/**
 * Clears all OctoFlow data from storage
 */
export const clearAllStorageData = (storageType: StorageType = 'session'): void => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    storage.removeItem(key);
  });
};

/**
 * Migrates data from session storage to local storage
 * Useful for persisting data across browser sessions
 */
export const migrateSessionToLocal = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      localStorage.setItem(key, value);
    }
  });
};

/**
 * Checks if there is existing assessment data in storage
 */
export const hasExistingAssessmentData = (storageType: StorageType = 'session'): boolean => {
  const storage = storageType === 'session' ? sessionStorage : localStorage;
  const responsesStr = storage.getItem(STORAGE_KEYS.STAGE_RESPONSES);
  
  if (!responsesStr) return false;
  
  try {
    const responses = JSON.parse(responsesStr);
    return Object.keys(responses).length > 0;
  } catch (e) {
    console.error('Error parsing stored responses:', e);
    return false;
  }
}; 