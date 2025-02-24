import React, { useState, useEffect, useCallback } from 'react';
import { KeyboardShortcut } from '../types';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import './styles.css';

interface KeyboardShortcutHelperProps {
  shortcuts: KeyboardShortcut[];
  isEnabled?: boolean;
  onClose?: () => void;
  stage?: string;
}

export function KeyboardShortcutHelper({
  shortcuts,
  isEnabled = true,
  onClose,
  stage
}: KeyboardShortcutHelperProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { playSound } = useAudioFeedback();

  const handleToggleVisibility = useCallback(() => {
    setIsVisible(prev => {
      const newValue = !prev;
      playSound(newValue ? 'info' : 'navigation');
      return newValue;
    });
  }, [playSound]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isEnabled) return;

      if (event.key === '?' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        handleToggleVisibility();
      } else if (event.key === 'Escape' && isVisible) {
        event.preventDefault();
        setIsVisible(false);
        onClose?.();
        playSound('navigation');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnabled, isVisible, onClose, handleToggleVisibility, playSound]);

  if (!isVisible) return null;

  // Group shortcuts by category
  const categories = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => prev === category ? null : category);
    playSound('navigation');
  };

  return (
    <div 
      role="dialog"
      aria-labelledby="keyboard-shortcuts-title"
      className="keyboard-shortcut-helper"
    >
      <div className="helper-content">
        <header className="helper-header">
          <h2 id="keyboard-shortcuts-title">
            Keyboard Shortcuts {stage ? `for ${stage}` : ''}
          </h2>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
              playSound('navigation');
            }}
            className="close-button"
            aria-label="Close keyboard shortcuts"
          >
            ×
          </button>
        </header>

        <div className="shortcuts-container">
          {Object.entries(categories).map(([category, categoryShortcuts]) => (
            <div key={category} className="shortcut-category">
              <button
                className="category-header"
                onClick={() => handleCategoryClick(category)}
                aria-expanded={activeCategory === category}
                aria-controls={`category-${category}`}
              >
                <span>{category}</span>
                <span className="expand-icon">
                  {activeCategory === category ? '−' : '+'}
                </span>
              </button>
              <div
                id={`category-${category}`}
                className={`category-shortcuts ${activeCategory === category ? 'expanded' : ''}`}
                role="list"
              >
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${shortcut.key}-${index}`}
                    className="shortcut-item"
                    role="listitem"
                  >
                    <kbd>{shortcut.key}</kbd>
                    <span className="shortcut-description">
                      {shortcut.description}
                      {shortcut.warning && (
                        <span className="warning-text" role="alert">
                          {shortcut.warning}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="helper-footer">
          <LiveRegion>
            Press ? to toggle shortcuts, Escape to close
          </LiveRegion>
        </footer>
      </div>

      <style jsx>{`
        .keyboard-shortcut-helper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .helper-content {
          background: var(--surface-background);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .helper-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .close-button {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--text-secondary);
        }

        .shortcuts-container {
          padding: 1rem;
        }

        .shortcut-category {
          margin-bottom: 1rem;
        }

        .category-header {
          width: 100%;
          text-align: left;
          padding: 0.75rem;
          background: var(--surface-background-elevated);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .expand-icon {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .category-shortcuts {
          display: none;
          padding: 0.5rem 0;
        }

        .category-shortcuts.expanded {
          display: block;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          gap: 1rem;
        }

        kbd {
          background: var(--kbd-background);
          border: 1px solid var(--kbd-border);
          border-radius: 3px;
          padding: 0.25rem 0.5rem;
          font-size: 0.9rem;
          min-width: 1.5rem;
          text-align: center;
        }

        .shortcut-description {
          flex: 1;
          color: var(--text-primary);
        }

        .warning-text {
          color: var(--warning-text);
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .helper-footer {
          padding: 1rem;
          text-align: center;
          border-top: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default KeyboardShortcutHelper;