import React, { useState, useCallback } from 'react';
import { LiveRegion } from './LiveRegion';
import type { KeyboardShortcut } from '../types/keyboard';
import type { KeyboardShortcutHelperProps } from '../types/props';

export const KeyboardShortcutHelper: React.FC<KeyboardShortcutHelperProps> = ({
  shortcuts,
  stage
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeShortcut, setActiveShortcut] = useState<KeyboardShortcut | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const shortcut = shortcuts.find(s => s.key === event.key);
    if (shortcut) {
      setActiveShortcut(shortcut);
      shortcut.action();
    }
  }, [shortcuts]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isVisible) return null;

  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className="keyboard-shortcuts" aria-label="Keyboard shortcuts">
      <LiveRegion>
        {activeShortcut && (
          <div className="active-shortcut">
            Using shortcut: {activeShortcut.description}
          </div>
        )}
      </LiveRegion>

      <button
        className="close-button"
        onClick={() => setIsVisible(false)}
        aria-label="Close keyboard shortcuts"
      >
        ×
      </button>

      {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
        <div key={category} className="shortcut-category">
          <h3>{category}</h3>
          <ul>
            {shortcuts.map((shortcut) => (
              <li key={shortcut.key} className="shortcut-item">
                <kbd>{shortcut.key}</kbd>
                <span>{shortcut.description}</span>
                {shortcut.warning && (
                  <span className="warning" role="alert">
                    {shortcut.warning}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};