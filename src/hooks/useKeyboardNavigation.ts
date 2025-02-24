import { useState, useEffect, useCallback } from 'react';
import { UseKeyboardNavigationConfig, UseKeyboardNavigationResult } from '../types/hooks';
import { useErrorManagement } from './useErrorManagement';
import { Stage } from '../types';
import { trackCTAClick } from '../utils/analytics';
import { KeyboardShortcut } from '../types';
import { useError } from '../contexts/ErrorContext';

interface UseKeyboardNavigationOptions {
  stage?: Stage;
  onNext?: () => void;
  onPrevious?: () => void;
  onEscape?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  shortcuts?: KeyboardShortcut[];
  isEnabled?: boolean;
  enableArrowKeys?: boolean;
  focusSelector?: string;
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;
  allowInErrorState?: boolean;
  onError?: (error: Error) => void;
}

interface KeyboardState {
  activeShortcut: KeyboardShortcut | null;
  focusIndex: number;
  isListening: boolean;
}

export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const {
    activeErrorCount,
    isHandlingError,
    clearError,
    getActiveErrors
  } = useErrorManagement({ stage: options.stage });

  const { error: contextError } = useError();

  const [state, setState] = useState<KeyboardState>({
    activeShortcut: null,
    focusIndex: -1,
    isListening: options.isEnabled ?? true
  });

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (options.disabled || !state.isListening) return;

    // Don't handle keyboard events if there's an error, unless explicitly allowed
    if (contextError && !options.allowInErrorState) {
      return;
    }

    // Handle error state shortcuts first
    if (activeErrorCount > 0) {
      if (event.key === 'Escape') {
        options.onEscape?.();
        return;
      }

      if (event.key === 'r' && event.ctrlKey) {
        event.preventDefault();
        const errors = getActiveErrors();
        if (errors.length > 0) {
          clearError(errors[0].id)
            .then(() => options.onRetry?.())
            .catch(console.error);
        }
        return;
      }

      // Only allow shortcuts explicitly marked as allowed in error state
      const allowedShortcut = options.shortcuts?.find(
        s => s.key === event.key && s.allowInErrorState
      );
      if (allowedShortcut) {
        event.preventDefault();
        allowedShortcut.action();
      }
      return;
    }

    // Handle navigation shortcuts
    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        if (!isHandlingError && options.onNext) {
          event.preventDefault();
          options.onNext();
          trackCTAClick('keyboard_next');
        }
        break;

      case 'ArrowLeft':
      case 'Backspace':
        if (!isHandlingError && options.onPrevious) {
          event.preventDefault();
          options.onPrevious();
          trackCTAClick('keyboard_previous');
        }
        break;

      default:
        // Handle custom shortcuts
        const shortcut = options.shortcuts?.find(s => s.key === event.key);
        if (shortcut && !isHandlingError) {
          event.preventDefault();
          shortcut.action();
          trackCTAClick(`keyboard_shortcut_${event.key}`);
          options.onShortcutTriggered?.(shortcut);
        }
    }

    if (options.enableArrowKeys) {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          setState(prev => ({
            ...prev,
            focusIndex: prev.focusIndex > 0 ? prev.focusIndex - 1 : options.shortcuts?.length - 1 ?? 0
          }));
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          setState(prev => ({
            ...prev,
            focusIndex: prev.focusIndex < (options.shortcuts?.length ?? 0) - 1 ? prev.focusIndex + 1 : 0
          }));
          break;
        case 'Enter':
        case ' ':
          if (state.focusIndex >= 0 && state.focusIndex < (options.shortcuts?.length ?? 0)) {
            event.preventDefault();
            const selectedShortcut = options.shortcuts?.[state.focusIndex];
            if (selectedShortcut) {
              setState(prev => ({ ...prev, activeShortcut: selectedShortcut }));
              selectedShortcut.action();
              options.onShortcutTriggered?.(selectedShortcut);
            }
          }
          break;
      }
    }
  }, [
    options,
    activeErrorCount,
    isHandlingError,
    clearError,
    getActiveErrors,
    state.isListening,
    state.focusIndex,
    contextError
  ]);

  useEffect(() => {
    if (options.isEnabled) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [options.isEnabled, handleKeyPress]);

  useEffect(() => {
    setState(prev => ({ ...prev, isListening: options.isEnabled ?? true }));
  }, [options.isEnabled]);

  useEffect(() => {
    if (options.focusSelector && state.focusIndex >= 0) {
      const elements = document.querySelectorAll(options.focusSelector);
      if (elements[state.focusIndex]) {
        (elements[state.focusIndex] as HTMLElement).focus();
      }
    }
  }, [options.focusSelector, state.focusIndex]);

  const getShortcuts = useCallback(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        key: '→',
        description: 'Next question',
        action: () => options.onNext?.()
      },
      {
        key: '←',
        description: 'Previous question',
        action: () => options.onPrevious?.()
      },
      {
        key: 'Esc',
        description: 'Close error or dialog',
        action: () => options.onEscape?.(),
        allowInErrorState: true
      }
    ];

    if (activeErrorCount > 0) {
      defaultShortcuts.push({
        key: 'Ctrl+R',
        description: 'Retry after error',
        action: () => options.onRetry?.(),
        allowInErrorState: true
      });
    }

    return [...defaultShortcuts, ...(options.shortcuts || [])];
  }, [options, activeErrorCount]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    options.shortcuts?.push(shortcut);
  }, [options.shortcuts]);

  return {
    shortcuts: getShortcuts().map(s => ({
      ...s,
      ariaLabel: `Press ${s.key} to ${s.description}`
    })),
    isDisabled: options.disabled || isHandlingError,
    hasActiveErrors: activeErrorCount > 0,
    activeShortcut: state.activeShortcut,
    focusIndex: state.focusIndex,
    isListening: state.isListening,
    registerShortcut,
    isEnabled: !contextError || options.allowInErrorState,
    clearError
  };
};

export default useKeyboardNavigation;