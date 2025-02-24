import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { useError } from '../contexts/ErrorContext';
import { useErrorManagement } from './useErrorManagement';
import { KeyboardShortcut } from '../types';

jest.mock('../contexts/ErrorContext');
jest.mock('./useErrorManagement');

describe('useKeyboardNavigation', () => {
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnEscape = jest.fn();
  const mockOnRetry = jest.fn();
  const mockOnShortcutTriggered = jest.fn();

  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      description: 'Test 1',
      action: jest.fn()
    },
    {
      key: '2',
      description: 'Test 2',
      action: jest.fn()
    }
  ];

  beforeEach(() => {
    (useError as jest.Mock).mockReturnValue({ error: null });
    (useErrorManagement as jest.Mock).mockReturnValue({
      activeErrorCount: 0,
      isHandlingError: false,
      clearError: jest.fn(),
      getActiveErrors: jest.fn().mockReturnValue([])
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers keyboard event listeners when enabled', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation({
      shortcuts: mockShortcuts,
      isEnabled: true
    }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('handles navigation shortcuts correctly', () => {
    renderHook(() => useKeyboardNavigation({
      onNext: mockOnNext,
      onPrevious: mockOnPrevious,
      isEnabled: true
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);
    });

    expect(mockOnNext).toHaveBeenCalled();

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);
    });

    expect(mockOnPrevious).toHaveBeenCalled();
  });

  it('handles custom shortcuts', () => {
    renderHook(() => useKeyboardNavigation({
      shortcuts: mockShortcuts,
      isEnabled: true,
      onShortcutTriggered: mockOnShortcutTriggered
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: '1' });
      document.dispatchEvent(event);
    });

    expect(mockShortcuts[0].action).toHaveBeenCalled();
    expect(mockOnShortcutTriggered).toHaveBeenCalledWith(mockShortcuts[0]);
  });

  it('handles error state correctly', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      activeErrorCount: 1,
      isHandlingError: false,
      clearError: jest.fn(),
      getActiveErrors: jest.fn().mockReturnValue([{ id: 'error-1' }])
    });

    renderHook(() => useKeyboardNavigation({
      onEscape: mockOnEscape,
      onRetry: mockOnRetry,
      isEnabled: true
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(mockOnEscape).toHaveBeenCalled();

    act(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'r',
        ctrlKey: true
      });
      document.dispatchEvent(event);
    });

    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    renderHook(() => useKeyboardNavigation({
      shortcuts: mockShortcuts,
      isEnabled: false
    }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: '1' });
      document.dispatchEvent(event);
    });

    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
  });
});