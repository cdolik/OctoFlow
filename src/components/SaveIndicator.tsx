import React from 'react';
import { AssessmentSaveStatus } from '../types/assessment';
import './styles.css';

interface SaveIndicatorProps {
  status: AssessmentSaveStatus;
  className?: string;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, className = '' }) => {
  const getStatusText = (): string => {
    switch (status.status) {
      case 'saved':
        return 'All changes saved';
      case 'saving':
        return 'Saving changes...';
      case 'error':
        return 'Error saving changes';
      default:
        return '';
    }
  };

  const getStatusClass = (): string => {
    switch (status.status) {
      case 'saved':
        return 'save-status--saved';
      case 'saving':
        return 'save-status--saving';
      case 'error':
        return 'save-status--error';
      default:
        return '';
    }
  };

  return (
    <div
      className={`save-status ${getStatusClass()} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="save-status__icon" aria-hidden="true" />
      <span className="save-status__text">{getStatusText()}</span>
      {status.status === 'error' && (
        <button
          className="save-status__retry"
          onClick={() => window.location.reload()}
          aria-label="Retry saving changes"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default SaveIndicator;