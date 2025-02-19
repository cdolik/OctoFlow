import { Stage } from '../components/withFlowValidation';

const STORAGE_KEYS = {
  ASSESSMENT_RESPONSES: 'assessment_responses',
  CURRENT_STAGE: 'current_stage',
  PROGRESS: 'assessment_progress'
} as const;

interface StorageConfig {
  useSession: boolean;
  prefix: string;
}

// Environment-specific configuration
const getStorageConfig = (): StorageConfig => {
  const isGitHubPages = window.location.hostname.includes('github.io');
  return {
    useSession: isGitHubPages, // Use sessionStorage on GitHub Pages
    prefix: isGitHubPages ? 'ghp_' : 'local_'
  };
};

const getStorage = () => {
  const { useSession } = getStorageConfig();
  return useSession ? sessionStorage : localStorage;
};

const getPrefixedKey = (key: string): string => {
  const { prefix } = getStorageConfig();
  return `${prefix}${key}`;
};

export const saveAssessmentResponses = (responses: Record<string, unknown>): void => {
  try {
    const storage = getStorage();
    storage.setItem(
      getPrefixedKey(STORAGE_KEYS.ASSESSMENT_RESPONSES),
      JSON.stringify(responses)
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Try clearing old data first
      clearOldAssessmentData();
      // Retry save
      getStorage().setItem(
        getPrefixedKey(STORAGE_KEYS.ASSESSMENT_RESPONSES),
        JSON.stringify(responses)
      );
    } else {
      throw error;
    }
  }
};

export const getAssessmentResponses = (): Record<string, unknown> => {
  try {
    const storage = getStorage();
    const data = storage.getItem(getPrefixedKey(STORAGE_KEYS.ASSESSMENT_RESPONSES));
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const updateAssessmentResponse = (questionId: string, value: unknown): void => {
  const responses = getAssessmentResponses();
  responses[questionId] = value;
  saveAssessmentResponses(responses);
};

export const clearAssessmentData = (): void => {
  const storage = getStorage();
  Object.values(STORAGE_KEYS).forEach(key => {
    storage.removeItem(getPrefixedKey(key));
  });
};

export const clearAllStorage = (): void => {
  localStorage.clear();
  sessionStorage.clear();
};

// Helper to clear old assessment data while preserving recent progress
const clearOldAssessmentData = (): void => {
  const storage = getStorage();
  const currentStage = storage.getItem(getPrefixedKey(STORAGE_KEYS.CURRENT_STAGE));
  const responses = getAssessmentResponses();
  
  // Keep only current stage responses
  if (currentStage) {
    const currentResponses = Object.entries(responses)
      .filter(([key]) => key.startsWith(currentStage))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
    clearAssessmentData();
    saveAssessmentResponses(currentResponses);
  } else {
    clearAssessmentData();
  }
};