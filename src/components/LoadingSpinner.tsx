import React from 'react';
import { LiveRegion } from './LiveRegion';
import './styles.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', message, showProgress = false, progress = 0 }) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return { width: '16px', height: '16px' };
      case 'large':
        return { width: '48px', height: '48px' };
      default:
        return { width: '32px', height: '32px' };
    }
  };

  return (
    <div 
      className={`loading-spinner-container ${inline ? 'inline' : ''}`}
      role="status"
      aria-label={ariaLabel || message}
    >
      <div 
        className={`loading-spinner ${size}`}
        style={getSpinnerSize()}
      >
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
      </div>
      {message && (
        <LiveRegion aria-live="polite">
          <span className="loading-message">{message}</span>
        </LiveRegion>
      )}
      {showProgress && (
        <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;