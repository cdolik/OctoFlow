import React from 'react';
import { LiveRegion } from './LiveRegion';
import './styles.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  inline?: boolean;
  ariaLabel?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  inline = false,
  ariaLabel
}) => {
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
    </div>
  );
};

export default LoadingSpinner;