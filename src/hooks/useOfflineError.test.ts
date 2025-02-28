import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineError } from './useOfflineError';
import { errorAnalytics } from '../utils/errorAnalytics';

jest.mock('../utils/errorAnalytics');

describe('useOfflineError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  it('initializes with correct online status', () => {
    Object.defineProperty(navigator, 'onLine', { value: true });
    const { result } = renderHook(() => useOfflineError());
    expect(result.current.isOnline).toBe(true);

    Object.defineProperty(navigator, 'onLine', { value: false });
    const { result: offlineResult } = renderHook(() => useOfflineError());
    expect(offlineResult.current.isOnline).toBe(false);
  });

  it('updates online status on network events', () => {
    const { result } = renderHook(() => useOfflineError());
    
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });

  it('queues actions when offline', async () => {
    const { result } = renderHook(() => useOfflineError());
    const action = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'onLine', { value: false });
    
    act(() => {
      result.current.queueAction(action);
    });

    expect(result.current.queueLength).toBe(1);
    expect(action).not.toHaveBeenCalled();
  });

  it('processes queue when coming online', async () => {
    const { result } = renderHook(() => useOfflineError());
    const action1 = jest.fn().mockResolvedValue(undefined);
    const action2 = jest.fn().mockResolvedValue(undefined);

    // Go offline and queue actions
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    act(() => {
      result.current.queueAction(action1);
      result.current.queueAction(action2);
    });

    expect(result.current.queueLength).toBe(2);

    // Come back online
    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(action1).toHaveBeenCalled();
    expect(action2).toHaveBeenCalled();
    expect(result.current.queueLength).toBe(0);
  });

  it('handles failed queue processing', async () => {
    const { result } = renderHook(() => useOfflineError());
    const successAction = jest.fn().mockResolvedValue(undefined);
    const failedAction = jest.fn().mockRejectedValue(new Error('Action failed'));

    Object.defineProperty(navigator, 'onLine', { value: false });
    
    act(() => {
      result.current.queueAction(successAction);
      result.current.queueAction(failedAction);
    });

    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(successAction).toHaveBeenCalled();
    expect(failedAction).toHaveBeenCalled();
    expect(result.current.queueLength).toBe(1); // Failed action should be requeued
  });

  it('removes actions from queue', () => {
    const { result } = renderHook(() => useOfflineError());
    const action = jest.fn();

    act(() => {
      const id = result.current.queueAction(action);
      expect(result.current.queueLength).toBe(1);
      result.current.removeFromQueue(id);
    });

    expect(result.current.queueLength).toBe(0);
  });

  it('tracks recovery status in analytics', async () => {
    const { result } = renderHook(() => useOfflineError());
    const action = jest.fn().mockResolvedValue(undefined);

    let actionId: string;
    act(() => {
      actionId = result.current.queueAction(action);
    });

    await act(async () => {
      await result.current.processOfflineQueue();
    });

    expect(errorAnalytics.updateRecoveryStatus).toHaveBeenCalledWith(
      expect.any(String),
      true,
      1
    );
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOfflineError());
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});