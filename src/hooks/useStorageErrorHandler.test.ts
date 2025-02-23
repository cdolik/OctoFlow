import { renderHook, act } from '@testing-library/react';
import { useStorageErrorHandler } from './useStorageErrorHandler';
import { useStorage } from './useStorage';
import { validateState } from '../utils/storage/migrations';
import { trackError } from '../utils/analytics';

jest.mock('./useStorage');
jest.mock('../utils/storage/migrations');
jest.mock('../utils/analytics');

describe('useStorageErrorHandler', () => {
  const mockError = new Error('Storage error');
  const mockState = {
    version: '1.2',
    responses: {},
    currentStage: null,
    metadata: {
      lastSaved: new Date().toISOString(),
      questionCount: 0
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      recoverFromBackup: jest.fn().mockResolvedValue(mockState),
      clearStorage: jest.fn().mockResolvedValue(undefined),
      error: null
    });
    (validateState as jest.Mock).mockReturnValue(true);
  });

  it('handles storage errors automatically', async () => {
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      error: mockError
    });

    const onRecoverySuccess = jest.fn();
    const { result } = renderHook(() => useStorageErrorHandler({ onRecoverySuccess }));

    expect(result.current.lastError).toBe(mockError);
    expect(trackError).toHaveBeenCalledWith('storage_error', expect.any(Object));
  });

  it('attempts recovery from backup', async () => {
    const { result } = renderHook(() => useStorageErrorHandler());

    await act(async () => {
      const success = await result.current.handleStorageError(mockError);
      expect(success).toBe(true);
    });

    expect(result.current.retryCount).toBe(1);
    expect(result.current.isRecovering).toBe(false);
  });

  it('respects max retries limit', async () => {
    const maxRetries = 2;
    const { result } = renderHook(() => useStorageErrorHandler({ maxRetries }));

    // Simulate multiple failures
    for (let i = 0; i <= maxRetries; i++) {
      await act(async () => {
        await result.current.handleStorageError(mockError);
      });
    }

    expect(result.current.canRetry).toBe(false);
    expect(result.current.retryCount).toBe(maxRetries);
  });

  it('clears storage and starts fresh when recovery fails', async () => {
    const mockStorage = {
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      recoverFromBackup: jest.fn().mockRejectedValue(new Error('Backup failed')),
      clearStorage: jest.fn().mockResolvedValue(undefined),
      error: null
    };

    (useStorage as jest.Mock).mockReturnValue(mockStorage);
    (validateState as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useStorageErrorHandler());

    await act(async () => {
      await result.current.handleStorageError(mockError);
    });

    expect(mockStorage.clearStorage).toHaveBeenCalled();
    expect(mockStorage.saveState).toHaveBeenCalledWith(expect.objectContaining({
      version: '1.2',
      responses: {}
    }));
  });

  it('tracks recovery failures', async () => {
    const mockStorage = {
      state: mockState,
      saveState: jest.fn().mockRejectedValue(new Error('Save failed')),
      recoverFromBackup: jest.fn().mockRejectedValue(new Error('Backup failed')),
      clearStorage: jest.fn().mockRejectedValue(new Error('Clear failed')),
      error: null
    };

    (useStorage as jest.Mock).mockReturnValue(mockStorage);

    const onRecoveryFailure = jest.fn();
    const { result } = renderHook(() => useStorageErrorHandler({ onRecoveryFailure }));

    await act(async () => {
      await result.current.handleStorageError(mockError);
    });

    expect(trackError).toHaveBeenCalledWith('recovery_error', expect.any(Object));
    expect(onRecoveryFailure).toHaveBeenCalled();
  });
});