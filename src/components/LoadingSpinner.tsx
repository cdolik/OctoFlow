import React from 'react';
import './styles.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  'aria-label'?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  'aria-label': ariaLabel
}) => {
  const spinnerSizes = {
    small: 24,
    medium: 32,
    large: 48
  };

  return (
    <div
      className={`loading-container size-${size}`}
      role="status"
      aria-label={ariaLabel || message}
      aria-live="polite"
    >
      <svg
        width={spinnerSizes[size]}
        height={spinnerSizes[size]}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
        />
        <circle
          className="spinner-head"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          strokeWidth="3"
          strokeDasharray="63"
          strokeDashoffset="63"
        />
      </svg>
      <span className="loading-text" aria-hidden="true">
        {message}
      </span>
    </div>
  );
};

export default LoadingSpinner;