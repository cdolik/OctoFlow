import React, { useState, useEffect } from 'react';
import { KeyboardShortcut } from '../types';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import './styles.css';

interface KeyboardShortcutHelperProps {
  shortcuts: KeyboardShortcut[];
  isEnabled?: boolean;
}

const KeyboardShortcutHelper: React.FC<KeyboardShortcutHelperProps> = ({
  shortcuts,
  isEnabled = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { activeShortcut } = useKeyboardNavigation({
    shortcuts: [
      {
        key: '?',
        description: 'Show/hide keyboard shortcuts',
        action: () => setIsVisible(prev => !prev)
      },
      ...shortcuts
    ],
    isEnabled
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  if (!isEnabled || !isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      className="keyboard-shortcuts"
      aria-modal="true"
    >
      <div className="keyboard-shortcuts__content">
        <h2 className="keyboard-shortcuts__title">
          Keyboard Shortcuts
        </h2>
        <button
          className="keyboard-shortcuts__close"
          onClick={() => setIsVisible(false)}
          aria-label="Close keyboard shortcuts"
        >
          ✕
        </button>
        <div className="keyboard-shortcuts__list">
          {shortcuts.map((shortcut, index) => (
            <div
              key={shortcut.key}
              className={`keyboard-shortcuts__item ${
                activeShortcut?.key === shortcut.key ? 'is-active' : ''
              }`}
            >
              <kbd className="keyboard-shortcuts__key">{shortcut.key}</kbd>
              <span 
                className="keyboard-shortcuts__description"
                aria-label={`Press ${shortcut.key} to ${shortcut.description}`}
              >
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
        <div className="keyboard-shortcuts__tip">
          Press <kbd>?</kbd> to toggle this menu
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutHelper;