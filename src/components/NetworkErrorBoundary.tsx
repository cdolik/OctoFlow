import React from 'react';
import { useErrorBoundary } from '../hooks/useErrorBoundary';
import { NetworkError } from '../types/errors';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const NetworkErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { hasError, error, resetError } = useErrorBoundary('NetworkErrorBoundary');

  if (hasError && error instanceof NetworkError) {
    return (
      <div role="alert" aria-live="assertive">
        {fallback || (
          <div className="network-error">
            <h2>Network Error</h2>
            <p>There was a problem connecting to the server. Please check your connection and try again.</p>
            <button 
              onClick={resetError}
              className="retry-button"
              aria-label="Retry connection"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};