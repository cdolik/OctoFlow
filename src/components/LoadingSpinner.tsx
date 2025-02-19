import React from 'react';
import './styles.css';

export default function LoadingSpinner(): JSX.Element {
  return (
    <div className="loading-container" role="progressbar" aria-label="Loading">
      <div className="loading-spinner">
        <svg className="spinner" viewBox="0 0 50 50">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
      </div>
      <div className="loading-text">Loading...</div>
    </div>
  );
}