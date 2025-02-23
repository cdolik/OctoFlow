import { StorageManager } from '../../utils/storage/storageManager';
import storage from '../../utils/storage/indexedDB';
import { Stage } from '../../types';

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};

const mockIDBRequest = {
  onerror: null as any,
  onsuccess: null as any,
  onupgradeneeded: null as any,
  result: {
    createObjectStore: jest.fn(),
    transaction: jest.fn(),
    objectStoreNames: { contains: jest.fn() },
  },
};

describe('Storage System', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    // Setup IndexedDB mock
    (global as any).indexedDB = indexedDB;
    indexedDB.open.mockReturnValue(mockIDBRequest);
    
    // Clear session storage
    sessionStorage.clear();
    
    storageManager = new StorageManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('StorageManager', () => {
    const mockState = {
      version: '1.1',
      currentStage: 'pre-seed' as Stage,
      responses: { q1: 3 },
      metadata: {
        lastSaved: new Date().toISOString(),
        questionCount: 1
      }
    };

    it('saves state to both storage systems', async () => {
      const saveResult = await storageManager.saveState(mockState);
      expect(saveResult).toBe(true);

      const sessionData = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
      expect(sessionData).toEqual(mockState);
    });

    it('retrieves state from session storage first', async () => {
      sessionStorage.setItem('octoflow', JSON.stringify(mockState));
      const state = await storageManager.getState();
      expect(state).toEqual(mockState);
    });

    it('creates and restores backups', async () => {
      await storageManager.saveState(mockState);
      const backupCreated = await storageManager.createBackup();
      expect(backupCreated).toBe(true);

      const restoredState = await storageManager.restoreFromBackup();
      expect(restoredState).toBeTruthy();
    });

    it('handles storage migration', async () => {
      const oldState = {
        ...mockState,
        version: '1.0'
      };

      const migratedState = await storageManager.migrateToLatestVersion(oldState);
      expect(migratedState.version).toBe('1.1');
      expect(migratedState.metadata.previousVersion).toBe('1.0');
    });
  });

  describe('IndexedDB Storage', () => {
    beforeEach(() => {
      storage.init();
    });

    it('initializes database successfully', async () => {
      setTimeout(() => {
        mockIDBRequest.onsuccess({ target: { result: mockIDBRequest.result } });
      }, 0);

      await expect(storage.init()).resolves.not.toThrow();
    });

    it('handles database errors gracefully', async () => {
      setTimeout(() => {
        mockIDBRequest.onerror({ target: { error: new Error('DB Error') } });
      }, 0);

      await expect(storage.init()).rejects.toThrow('DB Error');
    });

    it('cleans up old backups', async () => {
      const mockTransaction = {
        objectStore: jest.fn().mockReturnValue({
          getAll: jest.fn().mockReturnValue({
            onsuccess: null,
            result: [
              { backupId: 'old', timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
              { backupId: 'new', timestamp: Date.now() }
            ]
          }),
          delete: jest.fn().mockReturnValue({
            onsuccess: null
          })
        })
      };

      mockIDBRequest.result.transaction = jest.fn().mockReturnValue(mockTransaction);

      setTimeout(() => {
        mockIDBRequest.onsuccess({ target: { result: mockIDBRequest.result } });
      }, 0);

      await storage.clearOldBackups();
      expect(mockTransaction.objectStore).toHaveBeenCalled();
    });
  });
});