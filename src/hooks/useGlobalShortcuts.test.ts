import { renderHook, act } from '@testing-library/react';
import { useGlobalShortcuts } from './useGlobalShortcuts';

describe('useGlobalShortcuts', () => {
  const mockShortcuts = [
    { key: 'ctrl+s', action: jest.fn() },
    { key: 'shift+?', action: jest.fn() },
    { key: 'alt+h', action: jest.fn() },
    { key: 'esc', action: jest.fn() }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles basic keyboard shortcuts', () => {
    renderHook(() => useGlobalShortcuts({ shortcuts: mockShortcuts }));

    // Test Ctrl+S
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      }));
    });
    expect(mockShortcuts[0].action).toHaveBeenCalled();

    // Test Shift+?
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true
      }));
    });
    expect(mockShortcuts[1].action).toHaveBeenCalled();
  });

  it('ignores shortcuts when disabled', () => {
    renderHook(() => useGlobalShortcuts({
      shortcuts: mockShortcuts,
      disabled: true
    }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      }));
    });
    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
  });

  it('respects enableInInputs option', () => {
    renderHook(() => useGlobalShortcuts({
      shortcuts: mockShortcuts,
      enableInInputs: false
    }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      }));
    });

    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('allows dynamic shortcut registration', () => {
    const { result } = renderHook(() => useGlobalShortcuts({
      shortcuts: mockShortcuts
    }));

    const newShortcut = { key: 'ctrl+n', action: jest.fn() };

    act(() => {
      result.current.registerShortcut(newShortcut);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true
      }));
    });

    expect(newShortcut.action).toHaveBeenCalled();
  });

  it('allows shortcut unregistration', () => {
    const { result } = renderHook(() => useGlobalShortcuts({
      shortcuts: mockShortcuts
    }));

    act(() => {
      result.current.unregisterShortcut('ctrl+s');
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true
      }));
    });

    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useGlobalShortcuts({
      shortcuts: mockShortcuts
    }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });
});