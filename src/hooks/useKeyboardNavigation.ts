import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onSelect: (index: number) => void;
  canProceed: boolean;
  isFirstQuestion: boolean;
  optionsCount: number;
}

export const useKeyboardNavigation = ({
  onNext,
  onBack,
  onSelect,
  canProceed,
  isFirstQuestion,
  optionsCount
}: UseKeyboardNavigationProps) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't handle keyboard events if user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        if (canProceed) {
          event.preventDefault();
          onNext();
        }
        break;

      case 'ArrowLeft':
        if (!isFirstQuestion) {
          event.preventDefault();
          onBack();
        }
        break;

      // Number keys 1-4 for option selection
      case '1':
      case '2':
      case '3':
      case '4':
        const optionIndex = parseInt(event.key) - 1;
        if (optionIndex < optionsCount) {
          event.preventDefault();
          onSelect(optionIndex);
        }
        break;

      default:
        break;
    }
  }, [onNext, onBack, onSelect, canProceed, isFirstQuestion, optionsCount]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

export default useKeyboardNavigation;