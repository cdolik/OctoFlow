import { Stage, AssessmentState } from '../../types';

const DB_NAME = 'octoflow';
const DB_VERSION = 1;
const STORE_NAME = 'assessment';

interface DBSchema {
  assessment: {
    key: string;
    value: AssessmentState;
  };
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async saveState(state: AssessmentState): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(state, 'currentState');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getState(): Promise<AssessmentState | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('currentState');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async saveBackup(state: AssessmentState): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const backup = {
        ...state,
        timestamp: Date.now(),
        backupId: `backup-${Date.now()}`
      };
      const request = store.put(backup, backup.backupId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getLatestBackup(): Promise<AssessmentState | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const backups = request.result
          .filter(item => item.backupId)
          .sort((a, b) => b.timestamp - a.timestamp);
        
        resolve(backups[0] || null);
      };
    });
  }

  async clearOldBackups(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const cutoff = Date.now() - maxAge;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const oldBackups = request.result
          .filter(item => item.backupId && item.timestamp < cutoff)
          .map(item => item.backupId);

        Promise.all(oldBackups.map(id => 
          new Promise<void>((res, rej) => {
            const deleteRequest = store.delete(id);
            deleteRequest.onerror = () => rej(deleteRequest.error);
            deleteRequest.onsuccess = () => res();
          })
        )).then(() => resolve())
          .catch(reject);
      };
    });
  }
}

export const storage = new IndexedDBStorage();
export default storage;