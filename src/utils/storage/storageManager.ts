import { Stage, AssessmentState } from '../../types';
import storage from './indexedDB';

class StorageManager {
  private hasIndexedDB: boolean;

  constructor() {
    this.hasIndexedDB = this.checkIndexedDBSupport();
  }

  private checkIndexedDBSupport(): boolean {
    try {
      return 'indexedDB' in window;
    } catch {
      return false;
    }
  }

  async saveState(state: AssessmentState): Promise<boolean> {
    try {
      // Always try to save to session storage first for quick access
      sessionStorage.setItem('octoflow', JSON.stringify(state));

      // If IndexedDB is available, save there as backup
      if (this.hasIndexedDB) {
        await storage.saveState(state);
      }

      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  async getState(): Promise<AssessmentState | null> {
    try {
      // Try session storage first
      const sessionData = sessionStorage.getItem('octoflow');
      if (sessionData) {
        return JSON.parse(sessionData);
      }

      // Fall back to IndexedDB if available
      if (this.hasIndexedDB) {
        return await storage.getState();
      }

      return null;
    } catch (error) {
      console.error('Error retrieving state:', error);
      return null;
    }
  }

  async createBackup(): Promise<boolean> {
    try {
      const state = await this.getState();
      if (!state) return false;

      if (this.hasIndexedDB) {
        await storage.saveBackup(state);
      }

      // Also save to session storage with timestamp
      const backup = {
        ...state,
        timestamp: Date.now(),
        isBackup: true
      };
      sessionStorage.setItem('octoflow_backup', JSON.stringify(backup));

      return true;
    } catch (error) {
      console.error('Backup creation failed:', error);
      return false;
    }
  }

  async restoreFromBackup(): Promise<AssessmentState | null> {
    try {
      // Try IndexedDB first
      if (this.hasIndexedDB) {
        const backup = await storage.getLatestBackup();
        if (backup) return backup;
      }

      // Fall back to session storage backup
      const sessionBackup = sessionStorage.getItem('octoflow_backup');
      if (sessionBackup) {
        return JSON.parse(sessionBackup);
      }

      return null;
    } catch (error) {
      console.error('Backup restoration failed:', error);
      return null;
    }
  }

  async clearStorage(): Promise<void> {
    try {
      sessionStorage.clear();
      
      if (this.hasIndexedDB) {
        await storage.clearOldBackups();
      }
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  }

  async migrateToLatestVersion(currentState: AssessmentState): Promise<AssessmentState> {
    const VERSION = '1.1';
    
    if (!currentState.version || currentState.version !== VERSION) {
      // Create backup before migration
      await this.createBackup();

      // Perform migration
      const migratedState: AssessmentState = {
        ...currentState,
        version: VERSION,
        metadata: {
          ...currentState.metadata,
          migrationDate: new Date().toISOString(),
          previousVersion: currentState.version || '1.0'
        }
      };

      // Save migrated state
      await this.saveState(migratedState);
      return migratedState;
    }

    return currentState;
  }
}