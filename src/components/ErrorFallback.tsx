import React from 'react';
import { AssessmentError } from '../types/errors';

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  showDetails?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError,
  showDetails = false 
}) => {
  const isAssessmentError = error instanceof AssessmentError;
  const severity = isAssessmentError ? error.severity : 'high';
  const isRecoverable = isAssessmentError ? error.recoverable : true;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className={`error-fallback error-severity-${severity}`}
    >
      <div className="error-content">
        <h2>An error occurred</h2>
        <p>{error.message}</p>
        
        {showDetails && (
          <details>
            <summary>Technical Details</summary>
            <pre>{error.stack}</pre>
            {isAssessmentError && (
              <div>
                <p>Severity: {severity}</p>
                <p>Recoverable: {isRecoverable ? 'Yes' : 'No'}</p>
                {error.context && (
                  <div>
                    <p>Context:</p>
                    <pre>{JSON.stringify(error.context, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </details>
        )}

        {isRecoverable && resetError && (
          <button
            onClick={resetError}
            className="retry-button"
            aria-label="Try again"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};