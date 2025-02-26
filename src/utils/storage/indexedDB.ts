import { AssessmentState } from '../../types';
import { StorageAdapter, ensureCompleteState } from './adapter';

export class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'octoflow_storage';
  private storeName = 'assessment';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to open database: ${(event.target as IDBOpenDBRequest).error}`));
      };
    });
  }

  async getState(): Promise<AssessmentState | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('current');

        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          if (result) {
            resolve(ensureCompleteState(result.state));
          } else {
            resolve(null);
          }
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to get state: ${(event.target as IDBRequest).error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveState(state: AssessmentState): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        // Create backup first
        this.createBackup(state).catch(error => {
          console.error('Failed to create backup:', error);
        });

        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // Store with an ID to easily retrieve it
        const request = store.put({ 
          id: 'current',
          state: state, 
          timestamp: Date.now()
        });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to save state: ${(event.target as IDBRequest).error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async createBackup(state: AssessmentState): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // Store state with backup ID and timestamp
        const request = store.put({ 
          id: `backup_${Date.now()}`,
          state: state, 
          timestamp: Date.now()
        });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to create backup: ${(event.target as IDBRequest).error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async restoreBackup(): Promise<AssessmentState | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.openCursor(null, 'prev');

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
          
          if (cursor) {
            // Find the most recent backup
            if (cursor.value.id.startsWith('backup_')) {
              resolve(ensureCompleteState(cursor.value.state));
              return;
            }
            cursor.continue();
          } else {
            resolve(null);
          }
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to restore backup: ${(event.target as IDBRequest).error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async clearState(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete('current');

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to clear state: ${(event.target as IDBRequest).error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}