import { renderHook, act } from '@testing-library/react';
import { useTimeTracker } from './useTimeTracker';

// Mock KeyboardShortcutsContext
jest.mock('../contexts/KeyboardShortcutsContext', () => ({
  useKeyboardShortcuts: () => ({
    disableShortcuts: jest.fn(),
    enableShortcuts: jest.fn()
  })
}));

describe('useTimeTracker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 1, 1));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tracks elapsed time correctly', () => {
    const mockTimeUpdate = jest.fn();
    const { result } = renderHook(() => 
      useTimeTracker({ onTimeUpdate: mockTimeUpdate })
    );

    expect(result.current.elapsedTime).toBe(0);

    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.elapsedTime).toBeGreaterThanOrEqual(5000);
    expect(mockTimeUpdate).toHaveBeenLastCalledWith(expect.any(Number));
  });

  it('handles idle state after timeout', () => {
    const { result } = renderHook(() => 
      useTimeTracker({ idleTimeout: 5000 })
    );

    expect(result.current.isIdle).toBe(false);

    // Advance past idle timeout
    act(() => {
      jest.advanceTimersByTime(5001);
    });

    expect(result.current.isIdle).toBe(true);
  });

  it('resets idle timer on activity', () => {
    const { result } = renderHook(() => 
      useTimeTracker({ idleTimeout: 5000 })
    );

    // Advance time but trigger activity before timeout
    act(() => {
      jest.advanceTimersByTime(4000);
      window.dispatchEvent(new MouseEvent('mousemove'));
    });

    expect(result.current.isIdle).toBe(false);

    // Advance remaining time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should still be active due to reset
    expect(result.current.isIdle).toBe(false);
  });

  it('controls progression based on minimum time', () => {
    const { result } = renderHook(() => 
      useTimeTracker({ minTime: 2000 })
    );

    expect(result.current.canProgress).toBe(false);

    // Advance time past minimum
    act(() => {
      jest.advanceTimersByTime(2001);
    });

    expect(result.current.canProgress).toBe(true);
  });

  it('handles pause and resume correctly', () => {
    const { result } = renderHook(() => useTimeTracker());

    act(() => {
      result.current.pause();
    });

    expect(result.current.isIdle).toBe(true);

    // Time shouldn't increase while paused
    const timeBeforePause = result.current.elapsedTime;
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedTime).toBe(timeBeforePause);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isIdle).toBe(false);
  });

  it('resets timer correctly', () => {
    const { result } = renderHook(() => useTimeTracker());

    // Advance time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.elapsedTime).toBeGreaterThan(0);

    // Reset timer
    act(() => {
      result.current.reset();
    });

    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.isIdle).toBe(false);
  });

  it('cleans up on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    const { unmount } = renderHook(() => useTimeTracker());
    
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('properly removes event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useTimeTracker());
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
  });
});