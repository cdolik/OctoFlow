import React, { forwardRef } from 'react';
import { AssessmentError } from '../types/errors';
import './AccessibleErrorAnnouncer.css';

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
        severity === 'high' ? 'This is a serious error.' : '',
        recoverable ? 'The application will attempt to recover.' : 'Please try again later.',
        isRecovering ? 'Attempting to recover...' : ''
      ].filter(Boolean).join(' ');
    };

    // Render different elements based on polite value
    if (polite) {
      return (
        <div
          ref={ref}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className={`error-announcer ${className} ${error ? 'has-error' : ''}`}
        >
          {getErrorMessage()}
        </div>
      );
    } else {
      return (
        <div
          ref={ref}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={`error-announcer ${className} ${error ? 'has-error' : ''}`}
        >
          {getErrorMessage()}
        </div>
      );
    }
  }
);