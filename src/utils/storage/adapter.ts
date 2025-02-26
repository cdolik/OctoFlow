import { AssessmentState, StorageState } from '../../types';
import { IndexedDBAdapter } from './indexedDB';
import { SessionStorageAdapter } from './sessionStorage';

export interface StorageAdapter {
  initialize(): Promise<void>;
  getState(): Promise<AssessmentState | null>;
  saveState(state: AssessmentState): Promise<void>;
  clearState(): Promise<void>;
  restoreBackup?(): Promise<AssessmentState | null>;
}

// Use IndexedDB in production, fallback to SessionStorage
const isTestEnvironment = process.env.NODE_ENV === 'test';

export const storageAdapter: StorageAdapter = isTestEnvironment 
  ? new SessionStorageAdapter()
  : new IndexedDBAdapter();

// Helper functions for state migration and error handling
export function createEmptyState(): AssessmentState {
  const currentTime = new Date().toISOString();
  
  return {
    version: '1.2',
    currentStage: null,
    responses: {},
    metadata: {
      lastSaved: currentTime,
      timeSpent: 0,
      attemptCount: 1,
      lastInteraction: Date.now()
    },
    progress: {
      questionIndex: 0,
      totalQuestions: 0,
      isComplete: false
    }
  };
}

// Converts partial storage state to full AssessmentState with defaults
export function ensureCompleteState(state: Partial<AssessmentState>): AssessmentState {
  const currentTime = new Date().toISOString();
  
  return {
    version: state.version || '1.2',
    currentStage: state.currentStage || null,
    responses: state.responses || {},
    metadata: {
      lastSaved: state.metadata?.lastSaved || currentTime,
      timeSpent: state.metadata?.timeSpent || 0,
      attemptCount: state.metadata?.attemptCount || 1,
      lastInteraction: state.metadata?.lastInteraction || Date.now(),
      stageStartTime: state.metadata?.stageStartTime,
      lastTransition: state.metadata?.lastTransition,
      categoryTimes: state.metadata?.categoryTimes
    },
    progress: {
      questionIndex: state.progress?.questionIndex || 0,
      totalQuestions: state.progress?.totalQuestions || 0,
      isComplete: state.progress?.isComplete || false,
      lastUpdated: state.progress?.lastUpdated || currentTime
    },
    preferences: state.preferences,
    stages: state.stages
  };
}