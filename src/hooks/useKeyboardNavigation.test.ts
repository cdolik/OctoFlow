import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { useErrorManagement } from './useErrorManagement';
import { trackCTAClick } from '../utils/analytics';

jest.mock('./useErrorManagement');
jest.mock('../utils/analytics');

describe('useKeyboardNavigation', () => {
  const mockErrorManagement = {
    activeErrorCount: 0,
    isHandlingError: false,
    clearError: jest.fn().mockResolvedValue(undefined),
    getActiveErrors: jest.fn().mockReturnValue([])
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useErrorManagement as jest.Mock).mockReturnValue(mockErrorManagement);
  });

  const simulateKeyPress = (key: string, ctrlKey = false) => {
    const event = new KeyboardEvent('keydown', { key, ctrlKey });
    act(() => {
      window.dispatchEvent(event);
    });
  };

  it('handles navigation shortcuts in normal state', () => {
    const onNext = jest.fn();
    const onPrevious = jest.fn();

    renderHook(() => useKeyboardNavigation({
      onNext,
      onPrevious
    }));

    simulateKeyPress('ArrowRight');
    expect(onNext).toHaveBeenCalled();
    expect(trackCTAClick).toHaveBeenCalledWith('keyboard_next');

    simulateKeyPress('ArrowLeft');
    expect(onPrevious).toHaveBeenCalled();
    expect(trackCTAClick).toHaveBeenCalledWith('keyboard_previous');
  });

  it('handles error state shortcuts', () => {
    const onRetry = jest.fn();
    const onEscape = jest.fn();
    const mockError = { id: 'error-1' };

    (useErrorManagement as jest.Mock).mockReturnValue({
      ...mockErrorManagement,
      activeErrorCount: 1,
      getActiveErrors: jest.fn().mockReturnValue([mockError])
    });

    renderHook(() => useKeyboardNavigation({
      onRetry,
      onEscape
    }));

    simulateKeyPress('r', true); // Ctrl+R
    expect(mockErrorManagement.clearError).toHaveBeenCalledWith(mockError.id);

    simulateKeyPress('Escape');
    expect(onEscape).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    const onNext = jest.fn();
    
    renderHook(() => useKeyboardNavigation({
      onNext,
      disabled: true
    }));

    simulateKeyPress('ArrowRight');
    expect(onNext).not.toHaveBeenCalled();
  });

  it('handles custom shortcuts', () => {
    const customAction = jest.fn();
    const shortcuts = [
      {
        key: 'c',
        description: 'Custom action',
        action: customAction
      }
    ];

    renderHook(() => useKeyboardNavigation({
      shortcuts
    }));

    simulateKeyPress('c');
    expect(customAction).toHaveBeenCalled();
    expect(trackCTAClick).toHaveBeenCalledWith('keyboard_shortcut_c');
  });

  it('allows specific shortcuts during error state', () => {
    const allowedAction = jest.fn();
    const disallowedAction = jest.fn();

    const shortcuts = [
      {
        key: 'a',
        description: 'Allowed in error',
        action: allowedAction,
        allowInErrorState: true
      },
      {
        key: 'd',
        description: 'Not allowed in error',
        action: disallowedAction
      }
    ];

    (useErrorManagement as jest.Mock).mockReturnValue({
      ...mockErrorManagement,
      activeErrorCount: 1
    });

    renderHook(() => useKeyboardNavigation({
      shortcuts
    }));

    simulateKeyPress('a');
    expect(allowedAction).toHaveBeenCalled();

    simulateKeyPress('d');
    expect(disallowedAction).not.toHaveBeenCalled();
  });

  it('provides correct shortcuts list based on state', () => {
    const customShortcut = {
      key: 'c',
      description: 'Custom',
      action: jest.fn()
    };

    const { result: normalResult } = renderHook(() => useKeyboardNavigation({
      shortcuts: [customShortcut]
    }));

    expect(normalResult.current.shortcuts).toHaveLength(4); // 3 default + 1 custom

    (useErrorManagement as jest.Mock).mockReturnValue({
      ...mockErrorManagement,
      activeErrorCount: 1
    });

    const { result: errorResult } = renderHook(() => useKeyboardNavigation({
      shortcuts: [customShortcut]
    }));

    expect(errorResult.current.shortcuts).toHaveLength(5); // Includes retry shortcut
  });

  it('prevents navigation during error handling', () => {
    const onNext = jest.fn();

    (useErrorManagement as jest.Mock).mockReturnValue({
      ...mockErrorManagement,
      isHandlingError: true
    });

    renderHook(() => useKeyboardNavigation({
      onNext
    }));

    simulateKeyPress('ArrowRight');
    expect(onNext).not.toHaveBeenCalled();
  });
});