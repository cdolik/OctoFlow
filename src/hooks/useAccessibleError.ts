import { useCallback, useRef, useEffect } from 'react';
import { useErrorManagement } from './useErrorManagement';
import { AssessmentError, ErrorContext } from '../types/errors';
import { shouldExposeErrorDetails } from '../utils/errorSanitization';

interface AccessibleErrorOptions {
  announceErrors?: boolean;
  politeAnnouncements?: boolean;
  autoFocus?: boolean;
  clearOnUnmount?: boolean;
}

export function useAccessibleError(options: AccessibleErrorOptions = {}) {
  const {
    announceErrors = true,
    politeAnnouncements = true,
    autoFocus = true,
    clearOnUnmount = true
  } = options;

  const {
    error,
    handleError,
    clearError,
    isRecovering
  } = useErrorManagement();

  const announcementRef = useRef<HTMLDivElement | null>(null);
  const previousError = useRef<Error | null>(null);

  const announceError = useCallback((error: Error, context?: ErrorContext) => {
    if (!announceErrors || !announcementRef.current) return;

    const message = shouldExposeErrorDetails(error)
      ? `Error: ${error.message}`
      : 'An error occurred';

    const severity = error instanceof AssessmentError ? error.severity : 'high';
    const recoverable = error instanceof AssessmentError ? error.recoverable : true;

    announcementRef.current.textContent = [
      message,
      severity === 'critical' ? 'This is a critical error.' : '',
      recoverable ? 'The application will attempt to recover.' : 'Please try again later.',
      context?.action ? `While ${context.action}` : ''
    ].filter(Boolean).join(' ');

    if (autoFocus) {
      announcementRef.current.focus();
    }
  }, [announceErrors, autoFocus]);

  const handleAccessibleError = useCallback(async (
    error: Error,
    context?: ErrorContext
  ): Promise<boolean> => {
    const handled = await handleError(error);
    
    if (error !== previousError.current) {
      announceError(error, context);
      previousError.current = error;
    }

    return handled;
  }, [handleError, announceError]);

  const clearAccessibleError = useCallback(() => {
    clearError();
    if (announcementRef.current) {
      announcementRef.current.textContent = 'Error cleared';
      previousError.current = null;
    }
  }, [clearError]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount) {
        clearAccessibleError();
      }
    };
  }, [clearOnUnmount, clearAccessibleError]);

  return {
    error,
    isRecovering,
    handleError: handleAccessibleError,
    clearError: clearAccessibleError,
    announcementRef,
    announceError
  };
}