import type { StorageState } from '../../types';
import { StorageFailedError } from '../errorHandling';
import { trackError } from '../analytics';
import { createErrorContext } from '../errorHandling';

const DB_NAME = 'octoflow_db';
const DB_VERSION = 1;
const STORE_NAME = 'assessment_state';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

export class IndexedDBAdapter {
  private db: IDBDatabase | null = null;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          const error = new StorageFailedError(
            'init',
            request.error?.message ?? 'Failed to open IndexedDB'
          );
          trackError(error, createErrorContext(
            'IndexedDBAdapter',
            'initialize',
            'Database initialization failed'
          ));
          reject(error);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error('IndexedDB initialization failed');
        trackError(err, createErrorContext(
          'IndexedDBAdapter',
          'initialize',
          'Unexpected error during initialization'
        ));
        reject(err);
      }
    });

    return this.initializationPromise;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    attemptNumber = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attemptNumber >= MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attemptNumber));
      return this.retryOperation(operation, attemptNumber + 1);
    }
  }

  async saveState(state: StorageState): Promise<void> {
    return this.retryOperation(async () => {
      if (!this.db) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        if (!this.db) {
          const error = new StorageFailedError('write', 'Database not initialized');
          trackError(error, createErrorContext(
            'IndexedDBAdapter',
            'saveState',
            'Database connection missing'
          ));
          reject(error);
          return;
        }

        try {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);

          const stateWithMetadata = {
            ...state,
            metadata: {
              ...state.metadata,
              lastModified: new Date().toISOString()
            }
          };

          const request = store.put(stateWithMetadata, 'currentState');

          request.onerror = () => {
            const error = new StorageFailedError('write', request.error?.message);
            trackError(error, createErrorContext(
              'IndexedDBAdapter',
              'saveState',
              'Write operation failed'
            ));
            reject(error);
          };

          transaction.oncomplete = () => resolve();
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to save state');
          trackError(err, createErrorContext(
            'IndexedDBAdapter',
            'saveState',
            'Unexpected error during save'
          ));
          reject(err);
        }
      });
    });
  }

  async getState(): Promise<StorageState | null> {
    return this.retryOperation(async () => {
      if (!this.db) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        if (!this.db) {
          const error = new StorageFailedError('read', 'Database not initialized');
          trackError(error, createErrorContext(
            'IndexedDBAdapter',
            'getState',
            'Database connection missing'
          ));
          reject(error);
          return;
        }

        try {
          const transaction = this.db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get('currentState');

          request.onerror = () => {
            const error = new StorageFailedError('read', request.error?.message);
            trackError(error, createErrorContext(
              'IndexedDBAdapter',
              'getState',
              'Read operation failed'
            ));
            reject(error);
          };

          request.onsuccess = () => resolve(request.result || null);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to get state');
          trackError(err, createErrorContext(
            'IndexedDBAdapter',
            'getState',
            'Unexpected error during get'
          ));
          reject(err);
        }
      });
    });
  }

  async clearAll(): Promise<void> {
    return this.retryOperation(async () => {
      if (!this.db) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        if (!this.db) {
          const error = new StorageFailedError('delete', 'Database not initialized');
          trackError(error, createErrorContext(
            'IndexedDBAdapter',
            'clearAll',
            'Database connection missing'
          ));
          reject(error);
          return;
        }

        try {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.clear();

          request.onerror = () => {
            const error = new StorageFailedError('delete', request.error?.message);
            trackError(error, createErrorContext(
              'IndexedDBAdapter',
              'clearAll',
              'Delete operation failed'
            ));
            reject(error);
          };

          transaction.oncomplete = () => resolve();
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to clear state');
          trackError(err, createErrorContext(
            'IndexedDBAdapter',
            'clearAll',
            'Unexpected error during clear'
          ));
          reject(err);
        }
      });
    });
  }

  async createBackup(state: StorageState): Promise<void> {
    return this.retryOperation(async () => {
      if (!this.db) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        if (!this.db) {
          const error = new StorageFailedError('write', 'Database not initialized');
          trackError(error, createErrorContext(
            'IndexedDBAdapter',
            'createBackup',
            'Database connection missing'
          ));
          reject(error);
          return;
        }

        try {
          const transaction = this.db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const backup = {
            ...state,
            metadata: {
              ...state.metadata,
              lastBackup: new Date().toISOString()
            }
          };

          const request = store.put(backup, `backup_${Date.now()}`);

          request.onerror = () => {
            const error = new StorageFailedError('write', request.error?.message);
            trackError(error, createErrorContext(
              'IndexedDBAdapter',
              'createBackup',
              'Write operation failed'
            ));
            reject(error);
          };

          transaction.oncomplete = () => resolve();
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to create backup');
          trackError(err, createErrorContext(
            'IndexedDBAdapter',
            'createBackup',
            'Unexpected error during backup'
          ));
          reject(err);
        }
      });
    });
  }
}