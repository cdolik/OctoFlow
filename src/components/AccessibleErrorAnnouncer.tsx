import React, { forwardRef } from 'react';
import { AssessmentError } from '../types/errors';

interface Props {
  error: Error | null;
  isRecovering?: boolean;
  polite?: boolean;
  className?: string;
}

export const AccessibleErrorAnnouncer = forwardRef<HTMLDivElement, Props>(
  ({ error, isRecovering, polite = true, className = '' }, ref) => {
    const getErrorMessage = () => {
      if (!error) return '';

      const isAssessmentError = error instanceof AssessmentError;
      const severity = isAssessmentError ? error.severity : 'high';
      const recoverable = isAssessmentError ? error.recoverable : true;

      return [
        error.message,
        severity === 'critical' ? 'This is a critical error.' : '',
        recoverable ? 'The application will attempt to recover.' : 'Please try again later.',
        isRecovering ? 'Attempting to recover...' : ''
      ].filter(Boolean).join(' ');
    };

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={polite ? 'polite' : 'assertive'}
        aria-atomic="true"
        className={`error-announcer ${className} ${error ? 'has-error' : ''}`}
      >
        {getErrorMessage()}

        <style jsx>{`
          .error-announcer {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }

          .error-announcer:focus {
            position: fixed;
            top: 1rem;
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            height: auto;
            padding: 1rem;
            margin: 0;
            overflow: visible;
            clip: auto;
            white-space: normal;
            background: var(--error-background);
            border: 1px solid var(--error-border);
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1000;
          }

          .error-announcer.has-error:focus {
            color: var(--error-text);
            outline: 2px solid var(--error-border);
            outline-offset: 2px;
          }
        `}</style>
      </div>
    );
  }
);