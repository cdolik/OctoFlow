import React from 'react';
import { LiveRegion } from './LiveRegion';
import type { AssessmentError } from '../types/errors';
import type { ErrorSeverity } from '../types/errors';

interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const isAssessmentError = (err: Error): err is AssessmentError => {
    return 'severity' in err && 'recoverable' in err;
  };

  const severity: ErrorSeverity = isAssessmentError(error) ? error.severity : 'medium';
  const recoverable = isAssessmentError(error) ? error.recoverable : true;

  return (
    <div role="alert" className="error-fallback">
      <LiveRegion>
        <h2 className="error-title">
          {severity === 'high' ? 'Critical Error' : 'Something went wrong'}
        </h2>
        <p className="error-message">{error.message}</p>
        {recoverable && onRetry && (
          <button 
            onClick={onRetry}
            className="retry-button"
          >
            Try again
          </button>
        )}
        {!recoverable && (
          <p className="error-help">
            Please refresh the page or try again later.
          </p>
        )}
      </LiveRegion>
    </div>
  );
};