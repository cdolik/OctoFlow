import { IndexedDBAdapter } from './IndexedDBAdapter';
import { StorageFailedError } from '../errorHandling';
import { createMockState } from '../../utils/testUtils';

describe('IndexedDBAdapter', () => {
  let adapter: IndexedDBAdapter;
  let indexedDB: IDBFactory;

  beforeEach(() => {
    // Setup fake IndexedDB
    indexedDB = {
      databases: jest.fn(),
      deleteDatabase: jest.fn(),
      open: jest.fn().mockReturnValue({
        result: {
          transaction: jest.fn(),
          objectStoreNames: {
            contains: jest.fn().mockReturnValue(false)
          },
          createObjectStore: jest.fn().mockReturnValue({
            put: jest.fn(),
            get: jest.fn(),
            getAll: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn()
          })
        },
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null
      })
    } as unknown as IDBFactory;

    // @ts-ignore
    global.indexedDB = indexedDB;
    adapter = new IndexedDBAdapter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes database successfully', async () => {
    const openRequest = indexedDB.open('octoflow_db', 1);
    setTimeout(() => {
      openRequest.onsuccess?.(new Event('success'));
    }, 0);

    await adapter.initialize();
    expect(indexedDB.open).toHaveBeenCalledWith('octoflow_db', 1);
  });

  it('handles initialization error', async () => {
    const error = new Error('Failed to open database');
    const openRequest = indexedDB.open('octoflow_db', 1);
    setTimeout(() => {
      openRequest.error = error;
      openRequest.onerror?.(new Event('error'));
    }, 0);

    await expect(adapter.initialize()).rejects.toThrow(StorageFailedError);
  });

  it('saves state successfully', async () => {
    const mockState = createMockState({ currentStage: 'pre-seed' });
    
    await adapter.initialize();
    const store = adapter['db']?.transaction().objectStore();
    const putRequest = store?.put(mockState);

    setTimeout(() => {
      putRequest?.onsuccess?.(new Event('success'));
    }, 0);

    await adapter.saveState(mockState);
    expect(store?.put).toHaveBeenCalledWith(expect.objectContaining({
      ...mockState,
      id: 'pre-seed'
    }));
  });

  it('retrieves state successfully', async () => {
    const mockState = createMockState({ currentStage: 'pre-seed' });
    
    await adapter.initialize();
    const store = adapter['db']?.transaction().objectStore();
    const getRequest = store?.get('pre-seed');

    setTimeout(() => {
      getRequest.result = mockState;
      getRequest?.onsuccess?.(new Event('success'));
    }, 0);

    const result = await adapter.getState('pre-seed');
    expect(result).toEqual(mockState);
  });

  it('handles read errors', async () => {
    const error = new Error('Failed to read');
    
    await adapter.initialize();
    const store = adapter['db']?.transaction().objectStore();
    const getRequest = store?.get('pre-seed');

    setTimeout(() => {
      getRequest.error = error;
      getRequest?.onerror?.(new Event('error'));
    }, 0);

    await expect(adapter.getState('pre-seed')).rejects.toThrow(StorageFailedError);
  });

  it('clears all data successfully', async () => {
    await adapter.initialize();
    const store = adapter['db']?.transaction().objectStore();
    const clearRequest = store?.clear();

    setTimeout(() => {
      clearRequest?.onsuccess?.(new Event('success'));
    }, 0);

    await adapter.clearAll();
    expect(store?.clear).toHaveBeenCalled();
  });

  it('deletes specific state successfully', async () => {
    await adapter.initialize();
    const store = adapter['db']?.transaction().objectStore();
    const deleteRequest = store?.delete('pre-seed');

    setTimeout(() => {
      deleteRequest?.onsuccess?.(new Event('success'));
    }, 0);

    await adapter.deleteState('pre-seed');
    expect(store?.delete).toHaveBeenCalledWith('pre-seed');
  });

  it('retrieves all states successfully', async () => {
    const mockStates = [
      createMockState({ currentStage: 'pre-seed' }),
      createMockState({ currentStage: 'seed' })
    ];
    
    await adapter.initialize();
    const store = adapter['db']?.transaction().objectStore();
    const getAllRequest = store?.getAll();

    setTimeout(() => {
      getAllRequest.result = mockStates;
      getAllRequest?.onsuccess?.(new Event('success'));
    }, 0);

    const result = await adapter.getAllStates();
    expect(result).toEqual(mockStates);
  });
});