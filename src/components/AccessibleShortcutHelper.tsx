import React, { useEffect, useRef } from 'react';
import { KeyboardShortcut } from '../types';
import { useErrorManagement } from '../hooks/useErrorManagement';
import './styles.css';

interface AccessibleShortcutHelperProps {
  shortcuts: KeyboardShortcut[];
  stage?: string;
  visible?: boolean;
  onClose?: () => void;
}

export function AccessibleShortcutHelper({
  shortcuts,
  stage,
  visible = true,
  onClose
}: AccessibleShortcutHelperProps): JSX.Element {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { activeErrorCount } = useErrorManagement({ stage });

  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [visible]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const filteredShortcuts = shortcuts.filter(s => 
    activeErrorCount === 0 || s.allowInErrorState
  );

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Keyboard Shortcuts"
      tabIndex={-1}
      className="shortcut-helper"
      onKeyDown={handleKeyDown}
    >
      <div className="shortcut-header">
        <h2>Keyboard Shortcuts {stage && `for ${stage}`}</h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="close-button"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="shortcut-grid" role="list">
        {filteredShortcuts.map((shortcut, index) => (
          <div
            key={`${shortcut.key}-${index}`}
            className="shortcut-item"
            role="listitem"
          >
            <kbd aria-label={`Press ${shortcut.key}`}>{shortcut.key}</kbd>
            <span>{shortcut.description}</span>
            {shortcut.allowInErrorState && (
              <span className="error-state-badge" aria-label="Available during errors">
                Error Safe
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="shortcut-footer" role="complementary">
        <p>
          Press <kbd>?</kbd> to toggle this help dialog at any time
          {activeErrorCount > 0 && (
            <span className="error-note">
              Note: Some shortcuts are disabled during errors
            </span>
          )}
        </p>
      </div>
    </div>
  );
}