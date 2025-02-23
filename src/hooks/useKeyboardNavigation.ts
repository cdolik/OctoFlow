import { useState, useEffect, useCallback } from 'react';
import { UseKeyboardNavigationConfig, UseKeyboardNavigationResult } from '../types/hooks';
import { useErrorManagement } from './useErrorManagement';
import { Stage } from '../types';
import { trackCTAClick } from '../utils/analytics';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  allowInErrorState?: boolean;
}

interface UseKeyboardNavigationOptions {
  stage?: Stage;
  onNext?: () => void;
  onPrevious?: () => void;
  onEscape?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions = {}) => {
  const {
    activeErrorCount,
    isHandlingError,
    clearError,
    getActiveErrors
  } = useErrorManagement({ stage: options.stage });

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (options.disabled) return;

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
        }
    }
  }, [
    options,
    activeErrorCount,
    isHandlingError,
    clearError,
    getActiveErrors
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

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

  return {
    shortcuts: getShortcuts(),
    isDisabled: options.disabled || isHandlingError,
    hasActiveErrors: activeErrorCount > 0
  };
};

export default useKeyboardNavigation;