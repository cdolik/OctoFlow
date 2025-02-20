import React from 'react';
import './styles.css';

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  size = 'medium'
}) => {
  const spinnerSize = {
    small: 30,
    medium: 50,
    large: 70
  }[size];

  return (
    <div 
      className={`loading-container ${size}`} 
      role="progressbar" 
      aria-label={message}
      aria-valuenow={showProgress ? progress : undefined}
    >
      <div className="loading-spinner">
        <svg 
          className="spinner" 
          viewBox="0 0 50 50"
          width={spinnerSize}
          height={spinnerSize}
        >
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
          {showProgress && (
            <circle
              className="progress-circle"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
              strokeDasharray={`${progress * 1.26} 126`}
              transform="rotate(-90 25 25)"
            />
          )}
        </svg>
      </div>
      <div className="loading-text">
        {message}
        {showProgress && (
          <span className="progress-text">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;