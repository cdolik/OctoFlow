import React, { useState, useEffect } from 'react';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import { KeyboardShortcut } from '../types/flowValidation';
import './styles.css';

interface AccessibleShortcutHelperProps {
  shortcuts: KeyboardShortcut[];
  showAdvanced?: boolean;
  onClose?: () => void;
}

export const AccessibleShortcutHelper: React.FC<AccessibleShortcutHelperProps> = ({
  shortcuts,
  showAdvanced = false,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useGlobalShortcuts({
    shortcuts: [
      {
        key: '?',
        action: () => setIsVisible(prev => !prev)
      },
      {
        key: 'esc',
        action: () => {
          if (isVisible) {
            setIsVisible(false);
            onClose?.();
          }
        }
      }
    ]
  });

  useEffect(() => {
    if (isVisible) {
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'alert');
      announcement.setAttribute('aria-live', 'polite');
      announcement.textContent = 'Keyboard shortcuts panel opened. Press Escape to close.';
      document.body.appendChild(announcement);
      
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, [isVisible]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < shortcuts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          shortcuts[focusedIndex].action();
        }
        break;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      className="shortcut-helper"
      onKeyDown={handleKeyDown}
    >
      <div className="shortcut-header">
        <h2>Keyboard Shortcuts</h2>
        <button
          aria-label="Close keyboard shortcuts"
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="close-button"
        >
          ×
        </button>
      </div>

      <div className="shortcut-list" role="list">
        {shortcuts.map((shortcut, index) => (
          <div
            key={shortcut.key}
            role="listitem"
            tabIndex={0}
            className={`shortcut-item ${focusedIndex === index ? 'focused' : ''}`}
            onFocus={() => setFocusedIndex(index)}
            onClick={() => shortcut.action()}
          >
            <kbd className="shortcut-key">{shortcut.key}</kbd>
            <span className="shortcut-description">{shortcut.description}</span>
          </div>
        ))}
      </div>

      {showAdvanced && (
        <div className="advanced-shortcuts" role="region" aria-label="Advanced shortcuts">
          <h3>Advanced Shortcuts</h3>
          <p>These shortcuts are available in all views</p>
          <ul>
            <li>
              <kbd>Ctrl + /</kbd>
              <span>Toggle this help panel</span>
            </li>
            <li>
              <kbd>Ctrl + S</kbd>
              <span>Force save current progress</span>
            </li>
            <li>
              <kbd>Ctrl + Z</kbd>
              <span>Undo last response</span>
            </li>
          </ul>
        </div>
      )}

      <div className="shortcut-footer">
        <p>
          Press <kbd>Tab</kbd> to navigate, <kbd>Enter</kbd> to select,
          and <kbd>Esc</kbd> to close
        </p>
      </div>
    </div>
  );
};