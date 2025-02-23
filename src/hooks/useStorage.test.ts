import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';
import { StorageManager } from '../utils/storage/storageManager';
import { Stage } from '../types';

// Mock StorageManager
jest.mock('../utils/storage/storageManager');

describe('useStorage', () => {
  const mockState = {
    version: '1.1',
    currentStage: 'pre-seed' as Stage,
    responses: { q1: 3 },
    metadata: {
      lastSaved: new Date().toISOString(),
      questionCount: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (StorageManager as jest.Mock).mockImplementation(() => ({
      getState: jest.fn().mockResolvedValue(mockState),
      saveState: jest.fn().mockResolvedValue(true),
      createBackup: jest.fn().mockResolvedValue(true),
      restoreFromBackup: jest.fn().mockResolvedValue(mockState),
      clearStorage: jest.fn().mockResolvedValue(undefined),
      migrateToLatestVersion: jest.fn().mockImplementation(state => ({
        ...state,
        version: '1.1'
      }))
    }));
  });

  it('loads initial state on mount', async () => {
    const { result } = renderHook(() => useStorage());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for state to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.state).toEqual(mockState);
  });

  it('saves state successfully', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(true);
    });

    expect(result.current.state).toEqual(mockState);
  });

  it('handles save errors gracefully', async () => {
    const mockError = new Error('Save failed');
    const onError = jest.fn();
    
    (StorageManager as jest.Mock).mockImplementation(() => ({
      ...jest.requireActual('../utils/storage/storageManager'),
      saveState: jest.fn().mockRejectedValue(mockError)
    }));

    const { result } = renderHook(() => useStorage({ onError }));

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(false);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('recovers from backup when available', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.recoverFromBackup();
      expect(success).toBe(true);
    });

    expect(result.current.state).toEqual(mockState);
  });

  it('handles missing backup gracefully', async () => {
    (StorageManager as jest.Mock).mockImplementation(() => ({
      ...jest.requireActual('../utils/storage/storageManager'),
      restoreFromBackup: jest.fn().mockResolvedValue(null)
    }));

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.recoverFromBackup();
      expect(success).toBe(false);
    });
  });

  it('creates automatic backups at specified intervals', async () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useStorage({
      backupInterval: 5000 // 5 seconds
    }));

    // Move forward 5 seconds
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    const mockStorageManager = (StorageManager as jest.Mock).mock.results[0].value;
    expect(mockStorageManager.createBackup).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('clears storage successfully', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await result.current.clearStorage();
    });

    expect(result.current.state).toBeNull();
  });

  it('migrates old state versions', async () => {
    const oldState = {
      ...mockState,
      version: '1.0'
    };

    (StorageManager as jest.Mock).mockImplementation(() => ({
      ...jest.requireActual('../utils/storage/storageManager'),
      getState: jest.fn().mockResolvedValue(oldState)
    }));

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.state?.version).toBe('1.1');
  });
});