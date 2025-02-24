import { StorageState } from '../../types';
import { StorageFailedError } from '../errorHandling';

const DB_NAME = 'octoflow_db';
const DB_VERSION = 1;
const STORE_NAME = 'assessment_state';

export class IndexedDBAdapter {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new StorageFailedError('initialize', request.error?.message));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveState(state: StorageState): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const stateWithMetadata = {
        ...state,
        id: state.currentStage,
        lastModified: new Date().toISOString()
      };

      const request = store.put(stateWithMetadata);

      request.onerror = () => {
        reject(new StorageFailedError('write', request.error?.message));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async getState(stage: string): Promise<StorageState | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(stage);

      request.onerror = () => {
        reject(new StorageFailedError('read', request.error?.message));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  async getAllStates(): Promise<StorageState[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new StorageFailedError('read', request.error?.message));
      };

      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  }

  async deleteState(stage: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(stage);

      request.onerror = () => {
        reject(new StorageFailedError('delete', request.error?.message));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        reject(new StorageFailedError('clear', request.error?.message));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}