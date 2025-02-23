import { renderHook, act } from '@testing-library/react';
import { useErrorRecovery } from './useErrorRecovery';
import { trackError } from '../utils/analytics';

jest.mock('../utils/analytics');
jest.useFakeTimers();

describe('useErrorRecovery Hook', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useErrorRecovery());

    expect(result.current.attempts).toBe(0);
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.canAttemptRecovery()).toBe(true);
  });

  it('tracks recovery attempts', () => {
    const { result } = renderHook(() => useErrorRecovery({ maxAttempts: 3 }));

    act(() => {
      result.current.recordAttempt(new Error('Test error 1'));
      result.current.recordAttempt(new Error('Test error 2'));
    });

    expect(result.current.attempts).toBe(2);
    expect(result.current.errors).toHaveLength(2);
    expect(result.current.canAttemptRecovery()).toBe(true);
  });

  it('prevents recovery after max attempts', () => {
    const { result } = renderHook(() => useErrorRecovery({ maxAttempts: 2 }));

    act(() => {
      result.current.recordAttempt(new Error('Test error 1'));
      result.current.recordAttempt(new Error('Test error 2'));
    });

    expect(result.current.canAttemptRecovery()).toBe(false);
  });

  it('allows recovery after cooldown period', () => {
    const { result } = renderHook(() => 
      useErrorRecovery({ maxAttempts: 2, cooldownPeriod: 1000 })
    );

    act(() => {
      result.current.recordAttempt(new Error('Test error 1'));
      result.current.recordAttempt(new Error('Test error 2'));
    });

    expect(result.current.canAttemptRecovery()).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1001);
    });

    expect(result.current.canAttemptRecovery()).toBe(true);
  });

  it('persists recovery state', () => {
    const { result, rerender } = renderHook(() => 
      useErrorRecovery({ persistKey: 'test_recovery' })
    );

    act(() => {
      result.current.recordAttempt(new Error('Test error'));
    });

    // Simulate component remount
    rerender();

    expect(result.current.attempts).toBe(1);
    expect(result.current.errors).toContain('Test error');
  });

  it('handles persistence failures gracefully', () => {
    // Mock storage error
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => { throw new Error('Storage full'); });

    const { result } = renderHook(() => useErrorRecovery());

    act(() => {
      result.current.recordAttempt(new Error('Test error'));
    });

    expect(trackError).toHaveBeenCalled();
    expect(result.current.attempts).toBe(1);

    mockSetItem.mockRestore();
  });

  it('calculates remaining cooldown time', () => {
    const { result } = renderHook(() => 
      useErrorRecovery({ maxAttempts: 2, cooldownPeriod: 5000 })
    );

    act(() => {
      result.current.recordAttempt(new Error('Error 1'));
      result.current.recordAttempt(new Error('Error 2'));
    });

    expect(result.current.getRemainingCooldown()).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.getRemainingCooldown()).toBeLessThanOrEqual(2000);
  });

  it('resets recovery state', () => {
    const { result } = renderHook(() => useErrorRecovery());

    act(() => {
      result.current.recordAttempt(new Error('Test error'));
      result.current.resetRecovery();
    });

    expect(result.current.attempts).toBe(0);
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.canAttemptRecovery()).toBe(true);
  });

  it('automatically resets after cooldown', () => {
    const { result } = renderHook(() => 
      useErrorRecovery({ maxAttempts: 2, cooldownPeriod: 1000 })
    );

    act(() => {
      result.current.recordAttempt(new Error('Error 1'));
      result.current.recordAttempt(new Error('Error 2'));
      jest.advanceTimersByTime(1001);
    });

    expect(result.current.attempts).toBe(0);
    expect(result.current.errors).toHaveLength(0);
  });
});