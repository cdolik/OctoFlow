import { StorageState, AssessmentState } from '../../types';
import { validateStorageState } from '../flowValidator';

const STORAGE_KEY = 'octoflow';
const BACKUP_KEY = 'octoflow_backup';
const CURRENT_VERSION = '1.1';

export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async saveState(state: AssessmentState): Promise<boolean> {
    try {
      const currentState = await this.getState();
      if (currentState) {
        await this.backup(currentState);
      }

      const stateWithMetadata: AssessmentState = {
        ...state,
        version: CURRENT_VERSION,
        metadata: {
          ...state.metadata,
          lastSaved: new Date().toISOString(),
          timeSpent: state.metadata.timeSpent || 0,
          attemptCount: (state.metadata.attemptCount || 0) + 1
        }
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithMetadata));
      return true;
    } catch {
      return false;
    }
  }

  async getState(): Promise<AssessmentState | null> {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getBackup();
      }

      const state = JSON.parse(stored);
      return validateStorageState(state) ? state : null;
    } catch {
      return null;
    }
  }

  private async backup(state: AssessmentState): Promise<void> {
    try {
      sessionStorage.setItem(BACKUP_KEY, JSON.stringify({
        ...state,
        metadata: {
          ...state.metadata,
          lastBackup: new Date().toISOString()
        }
      }));
    } catch {
      // Ignore backup failures
    }
  }

  private async getBackup(): Promise<AssessmentState | null> {
    try {
      const backup = sessionStorage.getItem(BACKUP_KEY);
      if (!backup) return null;

      const state = JSON.parse(backup);
      return validateStorageState(state) ? state : null;
    } catch {
      return null;
    }
  }

  clearStorage(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(BACKUP_KEY);
    } catch {
      // Ignore cleanup errors
    }
  }

  async migrateState(oldState: AssessmentState): Promise<AssessmentState> {
    if (!oldState.version || oldState.version === CURRENT_VERSION) {
      return oldState;
    }

    // Perform version-specific migrations
    const migratedState: AssessmentState = {
      ...oldState,
      version: CURRENT_VERSION,
      metadata: {
        ...oldState.metadata,
        lastTransition: new Date().toISOString(),
        timeSpent: oldState.metadata.timeSpent || 0,
        attemptCount: oldState.metadata.attemptCount || 1
      },
      progress: {
        ...oldState.progress,
        isComplete: oldState.progress.isComplete || false
      }
    };

    // Save migrated state
    await this.saveState(migratedState);
    return migratedState;
  }
}