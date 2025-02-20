import React, { useEffect, useState } from 'react';
import './styles.css';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ isSaving, lastSaved }) => {
  const [showIndicator, setShowIndicator] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isSaving) {
      setShowIndicator(true);
      setMessage('Saving...');
    } else if (lastSaved) {
      setMessage('Progress saved');
      // Keep showing for 2 seconds after save
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  if (!showIndicator) return null;

  return (
    <div 
      className={`save-indicator ${isSaving ? 'saving' : 'saved'}`}
      role="status"
      aria-live="polite"
    >
      <span className="save-indicator-dot" />
      {message}
      {lastSaved && !isSaving && (
        <span className="save-time">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default SaveIndicator;