import { useState, useEffect, useCallback } from 'react';
import { UseKeyboardNavigationConfig, UseKeyboardNavigationResult } from '../types/hooks';

export const useKeyboardNavigation = ({
  onNext,
  onBack,
  onSelect,
  shortcuts = [],
  disabled = false
}: UseKeyboardNavigationConfig): UseKeyboardNavigationResult => {
  const [currentFocus, setCurrentFocus] = useState<number>(-1);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Handle navigation keys
    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        event.preventDefault();
        onNext();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onBack();
        break;
      case 'Tab':
        // Allow natural tab navigation
        break;
      default:
        // Handle numeric shortcuts (1-9)
        const numKey = Number(event.key);
        if (!isNaN(numKey) && numKey > 0 && onSelect) {
          event.preventDefault();
          onSelect(numKey - 1);
          setCurrentFocus(numKey - 1);
        }
        
        // Handle custom shortcuts
        shortcuts.forEach(shortcut => {
          if (
            event.key.toLowerCase() === shortcut.key.toLowerCase() &&
            event.ctrlKey === !!shortcut.requiresCtrl
          ) {
            event.preventDefault();
            shortcut.action();
          }
        });
    }
  }, [onNext, onBack, onSelect, shortcuts, disabled]);

  const resetFocus = useCallback(() => {
    setCurrentFocus(-1);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    currentFocus,
    setFocus: setCurrentFocus,
    resetFocus
  };
};

export default useKeyboardNavigation;