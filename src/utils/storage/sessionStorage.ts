import { AssessmentState } from '../../types';
import { StorageAdapter, ensureCompleteState } from './adapter';

const STORAGE_KEY = 'octoflow_assessment';
const BACKUP_KEY = 'octoflow_assessment_backup';

export class SessionStorageAdapter implements StorageAdapter {
  async initialize(): Promise<void> {
    // No initialization needed for sessionStorage
    return Promise.resolve();
  }

  async getState(): Promise<AssessmentState | null> {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const backup = sessionStorage.getItem(BACKUP_KEY);
        return backup ? ensureCompleteState(JSON.parse(backup)) : null;
      }
      return ensureCompleteState(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to get state from session storage:', error);
      return null;
    }
  }

  async saveState(state: AssessmentState): Promise<void> {
    try {
      // Create backup first
      const current = sessionStorage.getItem(STORAGE_KEY);
      if (current) {
        sessionStorage.setItem(BACKUP_KEY, current);
      }
      
      // Update with new state
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(`Failed to save state: ${error}`));
    }
  }

  async restoreBackup(): Promise<AssessmentState | null> {
    try {
      const backup = sessionStorage.getItem(BACKUP_KEY);
      return backup ? ensureCompleteState(JSON.parse(backup)) : null;
    } catch (error) {
      return Promise.reject(new Error(`Failed to restore backup: ${error}`));
    }
  }

  async clearState(): Promise<void> {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(BACKUP_KEY);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(`Failed to clear state: ${error}`));
    }
  }
}