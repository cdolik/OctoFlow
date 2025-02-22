import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { UseKeyboardNavigationConfig } from '../types/hooks';

describe('useKeyboardNavigation', () => {
  const mockConfig: UseKeyboardNavigationConfig = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    onSelect: jest.fn(),
    shortcuts: [
      { key: 'S', requiresCtrl: true, action: jest.fn() },
      { key: 'R', requiresCtrl: false, action: jest.fn() }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles basic navigation keys', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockConfig));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(mockConfig.onNext).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(mockConfig.onBack).toHaveBeenCalled();
  });

  it('handles numeric shortcuts', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockConfig));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    });

    expect(mockConfig.onSelect).toHaveBeenCalledWith(1);
    expect(result.current.currentFocus).toBe(1);
  });

  it('handles custom shortcuts', () => {
    renderHook(() => useKeyboardNavigation(mockConfig));

    // Test Ctrl+S shortcut
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'S', ctrlKey: true }));
    });
    expect(mockConfig.shortcuts[0].action).toHaveBeenCalled();

    // Test R shortcut without Ctrl
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'R' }));
    });
    expect(mockConfig.shortcuts[1].action).toHaveBeenCalled();
  });

  it('ignores keyboard events when disabled', () => {
    renderHook(() => useKeyboardNavigation({ ...mockConfig, disabled: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'S', ctrlKey: true }));
    });

    expect(mockConfig.onNext).not.toHaveBeenCalled();
    expect(mockConfig.onSelect).not.toHaveBeenCalled();
    expect(mockConfig.shortcuts[0].action).not.toHaveBeenCalled();
  });

  it('allows focus management', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockConfig));

    act(() => {
      result.current.setFocus(2);
    });
    expect(result.current.currentFocus).toBe(2);

    act(() => {
      result.current.resetFocus();
    });
    expect(result.current.currentFocus).toBe(-1);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardNavigation(mockConfig));
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });
});