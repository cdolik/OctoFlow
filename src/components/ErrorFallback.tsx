import React, { useEffect, useRef } from 'react';
import { useError } from '../contexts/ErrorContext';
import { trackCTAClick } from '../utils/analytics';
import './styles.css';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  recoverError?: () => Promise<void>;
  isRecovering?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  recoverError,
  isRecovering = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { getRemainingCooldown } = useError();
  const cooldownSeconds = Math.ceil(getRemainingCooldown() / 1000);

  useEffect(() => {
    // Focus the dialog on mount for screen readers
    dialogRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      resetError();
    }
  };

  const handleReset = (): void => {
    trackCTAClick('error_reset');
    resetError();
  };

  const handleRecover = async (): Promise<void> => {
    trackCTAClick('error_recover');
    await recoverError?.();
  };

  return (
    <div 
      className="error-dialog"
      role="alertdialog"
      aria-labelledby="error-title"
      aria-describedby="error-message"
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="error-content">
        <h2 id="error-title" className="error-title">
          We encountered an issue
        </h2>
        
        <div id="error-message" className="error-message">
          <p>{error.message}</p>
          {cooldownSeconds > 0 && (
            <p className="error-cooldown" aria-live="polite">
              Please wait {cooldownSeconds} seconds before trying again
            </p>
          )}
        </div>

        <div className="error-actions" role="group" aria-label="Error recovery options">
          <button
            onClick={handleReset}
            className="error-button reset"
            disabled={isRecovering}
            aria-busy={isRecovering}
          >
            Try Again
          </button>

          {recoverError && cooldownSeconds === 0 && (
            <button
              onClick={handleRecover}
              className="error-button recover"
              disabled={isRecovering}
              aria-busy={isRecovering}
            >
              Try to Resume
              {isRecovering && (
                <span className="visually-hidden"> (Loading...)</span>
              )}
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <pre 
            className="error-stack"
            aria-label="Error stack trace"
            tabIndex={0}
          >
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;