import React, { useState, useEffect } from 'react';
import './styles.css';

interface KeyboardShortcutHelperProps {
  shortcuts: Array<{
    key: string;
    description: string;
    icon?: string;
  }>;
  autoHide?: boolean;
  hideDelay?: number;
}

const KeyboardShortcutHelper: React.FC<KeyboardShortcutHelperProps> = ({
  shortcuts,
  autoHide = true,
  hideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="keyboard-helper"
      role="complementary"
      aria-label="Keyboard shortcuts"
    >
      <div className="keyboard-helper-content">
        {shortcuts.map(({ key, description, icon }) => (
          <div key={key} className="shortcut-item">
            <kbd className="shortcut-key">
              {icon && <span className="shortcut-icon">{icon}</span>}
              {key}
            </kbd>
            <span className="shortcut-description">{description}</span>
          </div>
        ))}
      </div>
      {autoHide && (
        <button 
          className="keyboard-helper-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close keyboard shortcuts helper"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default KeyboardShortcutHelper;