import React, { useEffect, useCallback } from 'react';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { ValidationError } from '../types/errors';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

interface Props {
  shortcuts: ShortcutConfig[];
  disabled?: boolean;
  onError?: (error: Error) => void;
}

export const KeyboardShortcutHelper: React.FC<Props> = ({
  shortcuts,
  disabled = false,
  onError
}) => {
  const { handleError } = useErrorManagement();

  const validateShortcuts = useCallback((configs: ShortcutConfig[]): void => {
    const usedKeys = new Map<string, string>();
    
    configs.forEach(config => {
      const shortcutKey = [
        config.ctrl ? 'Ctrl+' : '',
        config.alt ? 'Alt+' : '',
        config.shift ? 'Shift+' : '',
        config.key
      ].join('');

      if (usedKeys.has(shortcutKey)) {
        throw new ValidationError(`Duplicate keyboard shortcut: ${shortcutKey}`, {
          component: 'KeyboardShortcutHelper',
          action: 'validateShortcuts',
          timestamp: new Date().toISOString()
        });
      }

      usedKeys.set(shortcutKey, config.description);
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrl === event.ctrlKey &&
        !!shortcut.alt === event.altKey &&
        !!shortcut.shift === event.shiftKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      try {
        matchingShortcut.action();
      } catch (error) {
        handleError(error as Error);
        onError?.(error as Error);
      }
    }
  }, [shortcuts, disabled, handleError, onError]);

  useEffect(() => {
    try {
      validateShortcuts(shortcuts);
      document.addEventListener('keydown', handleKeyDown);
    } catch (error) {
      handleError(error as Error);
      onError?.(error as Error);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, handleKeyDown, validateShortcuts, handleError, onError]);

  return (
    <div className="keyboard-shortcuts" role="note" aria-label="Keyboard shortcuts">
      <ul className="shortcut-list">
        {shortcuts.map((shortcut, index) => (
          <li key={index} className="shortcut-item">
            <kbd className="shortcut-key">
              {[
                shortcut.ctrl && 'Ctrl',
                shortcut.alt && 'Alt',
                shortcut.shift && 'Shift',
                shortcut.key
              ]
                .filter(Boolean)
                .join(' + ')}
            </kbd>
            <span className="shortcut-description">{shortcut.description}</span>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .keyboard-shortcuts {
          margin: 1rem 0;
        }

        .shortcut-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .shortcut-key {
          display: inline-block;
          padding: 0.2rem 0.4rem;
          margin-right: 0.5rem;
          background: var(--kbd-background);
          border: 1px solid var(--kbd-border);
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.8rem;
          min-width: 1.5rem;
          text-align: center;
        }

        .shortcut-description {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};