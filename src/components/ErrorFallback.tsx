import React, { useEffect } from 'react';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import { AssessmentError } from '../types/errors';

interface ErrorFallbackProps {
  error: Error | AssessmentError;
  resetError?: () => void;
  errorInfo?: React.ErrorInfo;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  resetError,
  errorInfo,
  showDetails = false
}: ErrorFallbackProps): JSX.Element {
  const { playSound } = useAudioFeedback();

  useEffect(() => {
    playSound('error');
  }, [playSound]);

  const isRecoverable = !(error as AssessmentError)?.recoverable === false;
  const errorCode = (error as AssessmentError)?.code || 'UNKNOWN_ERROR';
  const severity = (error as AssessmentError)?.severity || 'error';

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'STORAGE_ERROR':
        return 'Unable to save your progress. Please ensure you have enough storage space and try again.';
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please refresh the page to continue.';
      case 'VALIDATION_ERROR':
        return 'There was an issue with your input. Please review and try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const getErrorAction = () => {
    switch (errorCode) {
      case 'STORAGE_ERROR':
        return 'Clear some browser storage and try again';
      case 'NETWORK_ERROR':
        return 'Check your connection and retry';
      case 'SESSION_EXPIRED':
        return 'Start a new session';
      case 'VALIDATION_ERROR':
        return 'Review and correct your input';
      default:
        return isRecoverable ? 'Try again' : 'Refresh the page';
    }
  };

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className={`error-fallback ${severity}`}
    >
      <div className="error-content">
        <h2 className="error-title">
          {severity === 'critical' ? 'Critical Error' : 'Something went wrong'}
        </h2>
        
        <p className="error-message">
          {getErrorMessage()}
        </p>

        {showDetails && errorInfo && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre>{errorInfo.componentStack}</pre>
          </details>
        )}

        <div className="error-actions">
          {isRecoverable && resetError && (
            <button
              onClick={() => {
                playSound('info');
                resetError();
              }}
              className="retry-button"
              aria-label={getErrorAction()}
            >
              {getErrorAction()}
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="refresh-button"
          >
            Refresh Page
          </button>
        </div>

        <LiveRegion>
          {`${severity === 'critical' ? 'Critical error' : 'Error'}: ${getErrorMessage()}`}
        </LiveRegion>
      </div>

      <style jsx>{`
        .error-fallback {
          padding: 2rem;
          margin: 1rem;
          border-radius: 8px;
          background: var(--error-background);
          color: var(--error-text);
        }

        .error-fallback.critical {
          background: var(--critical-error-background);
        }

        .error-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .error-title {
          margin: 0 0 1rem;
          font-size: 1.5rem;
          color: var(--error-title);
        }

        .error-message {
          margin: 1rem 0;
          line-height: 1.5;
        }

        .error-details {
          margin: 1.5rem 0;
          padding: 1rem;
          background: var(--error-details-background);
          border-radius: 4px;
        }

        .error-details summary {
          cursor: pointer;
          color: var(--text-secondary);
        }

        .error-details pre {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--code-background);
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.875rem;
        }

        .error-actions {
          margin-top: 1.5rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .retry-button,
        .refresh-button {
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .retry-button {
          background: var(--primary-color);
          color: white;
        }

        .refresh-button {
          background: transparent;
          border: 1px solid currentColor;
        }

        .retry-button:hover {
          background: var(--primary-color-dark);
        }

        .refresh-button:hover {
          background: var(--surface-background-hover);
        }

        @media (max-width: 768px) {
          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}