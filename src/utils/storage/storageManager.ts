import type { AssessmentState, StorageState, StorageProgress } from '../../types/storage';
import { validateStorageState } from '../flowValidator';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import { trackError } from '../analytics';
import { createErrorContext } from '../errorHandling';

const STORAGE_KEY = 'octoflow';
const BACKUP_KEY = 'octoflow_backup';
const CURRENT_VERSION = '1.1';
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

const createProgressDefaults = (): StorageProgress => ({
  questionIndex: 0,
  totalQuestions: 0,
  isComplete: false
});

export class StorageManager {
  private static instance: StorageManager;
  private adapter: IndexedDBAdapter;
  private backupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.adapter = new IndexedDBAdapter();
    this.setupBackupInterval();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private setupBackupInterval(): void {
    this.backupInterval = setInterval(async () => {
      try {
        const currentState = await this.getState();
        if (currentState) {
          await this.createBackup(currentState);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Backup failed');
        trackError(err, createErrorContext('StorageManager', 'backup', 'Automatic backup failed'));
      }
    }, BACKUP_INTERVAL);
  }

  async saveState(state: AssessmentState): Promise<boolean> {
    try {
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

      await this.adapter.saveState(stateWithMetadata);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithMetadata));
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to save state');
      trackError(err, createErrorContext('StorageManager', 'saveState', 'Failed to save state'));
      return false;
    }
  }

  async getState(): Promise<AssessmentState | null> {
    try {
      // Try session storage first
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        if (validateStorageState(state)) {
          return state as AssessmentState;
        }
      }

      // Fall back to IndexedDB
      const state = await this.adapter.getState();
      if (state && validateStorageState(state)) {
        return this.convertToAssessmentState(state);
      }

      return this.getBackup();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get state');
      trackError(err, createErrorContext('StorageManager', 'getState', 'Failed to retrieve state'));
      return null;
    }
  }

  private convertToAssessmentState(state: Partial<StorageState>): AssessmentState {
    const baseState: AssessmentState = {
      version: state.version || CURRENT_VERSION,
      currentStage: state.currentStage || null,
      responses: state.responses || {},
      metadata: {
        ...state.metadata,
        lastSaved: state.metadata?.lastSaved || new Date().toISOString(),
        timeSpent: state.metadata?.timeSpent || 0,
        attemptCount: state.metadata?.attemptCount || 0
      },
      progress: state.progress || createProgressDefaults()
    };

    return baseState;
  }

  async createBackup(state: AssessmentState): Promise<boolean> {
    try {
      const backupState = {
        ...state,
        metadata: {
          ...state.metadata,
          lastSaved: new Date().toISOString()
        }
      };

      await this.adapter.saveState(backupState);
      sessionStorage.setItem(BACKUP_KEY, JSON.stringify(backupState));
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create backup');
      trackError(err, createErrorContext('StorageManager', 'createBackup', 'Failed to create backup'));
      return false;
    }
  }

  private async getBackup(): Promise<AssessmentState | null> {
    try {
      const backup = sessionStorage.getItem(BACKUP_KEY);
      if (backup) {
        const state = JSON.parse(backup);
        if (validateStorageState(state)) {
          return this.convertToAssessmentState(state);
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  clearStorage(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(BACKUP_KEY);
      this.adapter.clearAll().catch(error => {
        trackError(
          error instanceof Error ? error : new Error('Failed to clear storage'),
          createErrorContext('StorageManager', 'clearStorage', 'Failed to clear IndexedDB storage')
        );
      });
    } catch (error) {
      trackError(
        error instanceof Error ? error : new Error('Failed to clear storage'),
        createErrorContext('StorageManager', 'clearStorage', 'Failed to clear session storage')
      );
    }
  }

  destroy(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
  }
}