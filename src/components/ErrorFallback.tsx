import React, { useCallback } from 'react';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import LoadingSpinner from './LoadingSpinner';

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  stage?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  stage
}) => {
  const {
    isRecovering,
    retryCount,
    handleError,
    canRetry
  } = useErrorManagement({
    stage,
    onRecoverySuccess: resetError
  });

  const handleRetry = useCallback(async () => {
    if (error.message.includes('storage')) {
      await handleError(error);
    } else if (resetError) {
      resetError();
    }
  }, [error, handleError, resetError]);

  useKeyboardNavigation({
    shortcuts: [
      {
        key: 'r',
        description: 'Retry',
        action: handleRetry,
        allowInErrorState: true
      }
    ]
  });

  if (isRecovering) {
    return (
      <div className="error-recovery">
        <LoadingSpinner 
          size="small"
          message="Attempting to recover..."
          aria-label="Recovery in progress"
        />
      </div>
    );
  }

  return (
    <div 
      className="error-container"
      role="alert"
      aria-live="assertive"
    >
      <div className="error-icon" aria-hidden="true">
        ⚠️
      </div>

      <h2>Something went wrong</h2>
      
      <div className="error-details">
        <p>{error.message}</p>
        {retryCount > 0 && (
          <p className="retry-count">
            Recovery attempts: {retryCount}
          </p>
        )}
      </div>

      <div className="error-actions">
        {canRetry ? (
          <button
            onClick={handleRetry}
            className="retry-button"
            autoFocus
          >
            Try Again (Press 'R')
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="reset-button"
          >
            Restart Assessment
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="error-debug">
          <summary>Technical Details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
};

export default ErrorFallback;