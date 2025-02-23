import React, { useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStorageErrorHandler } from '../hooks/useStorageErrorHandler';
import { trackError } from '../utils/analytics';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  onRecovery: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const {
    isRecovering,
    lastError,
    retryCount,
    handleStorageError,
    canRetry
  } = useStorageErrorHandler({
    onRecoverySuccess: resetErrorBoundary,
    maxRetries: 3
  });

  const handleRetry = useCallback(async () => {
    if (error.message.includes('storage')) {
      await handleStorageError(error);
    } else {
      resetErrorBoundary();
    }
  }, [error, handleStorageError, resetErrorBoundary]);

  if (isRecovering) {
    return (
      <div className="recovery-status">
        <LoadingSpinner size="small" />
        <p>Attempting to recover your progress...</p>
      </div>
    );
  }

  return (
    <div className="error-state assessment-error">
      <h2>Assessment Error</h2>
      <p>We encountered an issue during your assessment.</p>
      
      {lastError && (
        <div className="error-context">
          <p>Error details: {lastError.message}</p>
          {retryCount > 0 && <p>Recovery attempts: {retryCount}</p>}
        </div>
      )}
      
      <div className="error-actions">
        {canRetry ? (
          <button 
            onClick={handleRetry}
            className="retry-button"
          >
            Try to Recover
          </button>
        ) : (
          <button 
            onClick={resetErrorBoundary}
            className="reset-button"
          >
            Start Fresh
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>Technical Details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
};

const AssessmentErrorBoundary: React.FC<Props> = ({ children, onRecovery }) => {
  const handleError = (error: Error) => {
    trackError('assessment_error', {
      error: error.message,
      stack: error.stack
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onRecovery}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AssessmentErrorBoundary;
