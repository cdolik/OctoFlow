import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';
import { SessionManager } from '../utils/storage/SessionManager';
import { useError } from '../contexts/ErrorContext';
import { createMockState } from '../utils/testUtils';
import { IndexedDBAdapter } from '../utils/storage/IndexedDBAdapter';

jest.mock('../utils/storage/SessionManager');
jest.mock('../contexts/ErrorContext');
jest.mock('../utils/storage/IndexedDBAdapter');

describe('useStorage', () => {
  const mockHandleError = jest.fn();
  let mockSessionManager: jest.Mocked<SessionManager>;

  const mockState = {
    currentStage: 'pre-seed',
    stages: {
      'pre-seed': { isComplete: false }
    },
    metadata: {
      lastSaved: new Date().toISOString(),
      lastModified: Date.now()
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockSessionManager = SessionManager.getInstance() as jest.Mocked<SessionManager>;
    (useError as jest.Mock).mockReturnValue({ handleError: mockHandleError });
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      saveState: jest.fn().mockResolvedValue(true),
      getState: jest.fn().mockResolvedValue(mockState),
      clearAll: jest.fn().mockResolvedValue(undefined)
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useStorage());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads initial state from session manager', async () => {
    const mockState = createMockState({ stage: 'pre-seed' });
    mockSessionManager.getState.mockResolvedValue(mockState);

    const { result } = renderHook(() => useStorage());

    // Wait for state to load
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toEqual(mockState);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles save state through session manager', async () => {
    const mockState = createMockState({ stage: 'pre-seed' });
    mockSessionManager.queueChange.mockResolvedValue(true);

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(true);
    });

    expect(mockSessionManager.queueChange).toHaveBeenCalledWith(mockState);
    expect(result.current.state).toEqual(mockState);
  });

  it('handles session expiration', async () => {
    mockSessionManager.isSessionActive.mockReturnValue(false);
    
    renderHook(() => useStorage());

    // Fast forward past check interval
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockHandleError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Session expired'
      })
    );
  });

  it('provides session expiration time', () => {
    const mockExpiration = 900000; // 15 minutes
    mockSessionManager.getTimeUntilExpiration.mockReturnValue(mockExpiration);

    const { result } = renderHook(() => useStorage());

    expect(result.current.timeUntilExpiration).toBe(mockExpiration);
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useStorage());

    unmount();

    expect(mockSessionManager.destroy).toHaveBeenCalled();
  });

  it('handles storage errors', async () => {
    mockSessionManager.getState.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBeTruthy();
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('updates session activity on state changes', async () => {
    const mockState = createMockState({ stage: 'pre-seed' });
    
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await result.current.saveState(mockState);
    });

    expect(mockSessionManager.queueChange).toHaveBeenCalled();
  });

  it('initializes with saved state', async () => {
    const { result } = renderHook(() => useStorage());

    // Wait for initialization
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).toEqual(mockState);
  });

  it('saves state with metadata', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(true);
    });

    const adapter = (IndexedDBAdapter as jest.Mock).mock.instances[0];
    expect(adapter.saveState).toHaveBeenCalledWith(expect.objectContaining({
      id: 'current',
      metadata: expect.any(Object)
    }));
  });

  it('creates backups for completed stages', async () => {
    const completedState = {
      ...mockState,
      stages: {
        'pre-seed': { isComplete: true }
      }
    };

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await result.current.saveState(completedState);
    });

    const adapter = (IndexedDBAdapter as jest.Mock).mock.instances[0];
    expect(adapter.saveState).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'backup_pre-seed' })
    );
  });

  it('tracks user activity and session status', () => {
    const { result } = renderHook(() => useStorage());

    expect(result.current.isSessionActive).toBe(true);

    // Simulate inactivity
    act(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours
    });

    expect(result.current.isSessionActive).toBe(false);
  });

  it('updates activity on user interactions', () => {
    const { result } = renderHook(() => useStorage());

    // Simulate inactivity
    act(() => {
      jest.advanceTimersByTime(23 * 60 * 60 * 1000); // 23 hours
    });

    // Simulate user interaction
    act(() => {
      window.dispatchEvent(new MouseEvent('mousedown'));
    });

    expect(result.current.isSessionActive).toBe(true);
    expect(result.current.timeUntilExpiration).toBeGreaterThan(0);
  });

  it('auto-saves on session expiration', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await Promise.resolve(); // Wait for initialization
      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours
    });

    const adapter = (IndexedDBAdapter as jest.Mock).mock.instances[0];
    expect(adapter.saveState).toHaveBeenCalled();
  });

  it('clears state', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await result.current.clearState();
    });

    const adapter = (IndexedDBAdapter as jest.Mock).mock.instances[0];
    expect(adapter.clearAll).toHaveBeenCalled();
    expect(result.current.state).toBeNull();
  });

  it('handles save failures gracefully', async () => {
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      saveState: jest.fn().mockRejectedValue(new Error('Save failed')),
      getState: jest.fn().mockResolvedValue(null)
    }));

    const { result } = renderHook(() => useStorage());
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save state:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('calculates correct time until expiration', () => {
    const { result } = renderHook(() => useStorage());

    act(() => {
      jest.advanceTimersByTime(12 * 60 * 60 * 1000); // 12 hours
    });

    expect(result.current.timeUntilExpiration).toBe(12 * 60 * 60 * 1000);
  });

  it('removes event listeners on unmount', () => {
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useStorage());

    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(4); // For each tracked event
  });
});