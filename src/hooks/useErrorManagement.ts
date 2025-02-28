import { useCallback, useEffect, useState } from 'react';
import { ErrorContext, AssessmentError, ValidationError, StorageError } from '../types/errors';
import { errorReporter } from '../utils/errorReporting';
import { errorAnalytics } from '../utils/errorAnalytics';
import { Stage } from '../types';

interface ErrorManagementOptions {
  stage?: Stage;
  onUnrecoverableError?: (error: Error) => void;
  maxRetries?: number;
}

interface ErrorState {
  error: Error | null;
  isRecovering: boolean;
  retryCount: number;
  hasCriticalError: boolean;
  timestamp?: string;
}

export const useErrorManagement = (options: ErrorManagementOptions = {}) => {
  const [state, setState] = useState<ErrorState>({
    error: null,
    isRecovering: false,
    retryCount: 0,
    hasCriticalError: false
  });

  const { maxRetries = 3 } = options;

  const handleError = useCallback(async (
    error: Error,
    recoveryFn?: () => Promise<boolean>
  ): Promise<boolean> => {
    if (state.isRecovering) {
      return false;
    }

    const timestamp = new Date().toISOString();
    setState(prev => ({
      ...prev,
      error,
      isRecovering: true,
      retryCount: prev.retryCount + 1,
      hasCriticalError: error instanceof AssessmentError && error.severity === 'critical',
      timestamp
    }));

    const context: ErrorContext = {
      component: 'ErrorManagement',
      action: 'handleError',
      stage: options.stage,
      timestamp
    };

    try {
      if (error instanceof AssessmentError) {
        await errorReporter.report(error, context);
      } else {
        await errorReporter.report(
          new AssessmentError(error.message, {
            context,
            severity: error instanceof ValidationError ? 'low' : 'high',
            recoverable: !(error instanceof StorageError)
          }),
          context
        );
      }

      errorAnalytics.trackError(error, context);

      if (recoveryFn && state.retryCount < maxRetries) {
        const recovered = await recoveryFn();
        if (recovered) {
          setState(prev => ({
            ...prev,
            error: null,
            isRecovering: false
          }));
          errorAnalytics.updateRecoveryStatus(timestamp, true, state.retryCount);
          return true;
        }
      }

      if (options.onUnrecoverableError) {
        options.onUnrecoverableError(error);
      }

      setState(prev => ({
        ...prev,
        isRecovering: false
      }));

      errorAnalytics.updateRecoveryStatus(timestamp, false, state.retryCount);
      return false;
    } catch (e) {
      console.error('Error handling failed:', e);
      setState(prev => ({
        ...prev,
        isRecovering: false
      }));
      if (timestamp) {
        errorAnalytics.updateRecoveryStatus(timestamp, false, state.retryCount);
      }
      return false;
    }
  }, [state.isRecovering, state.retryCount, maxRetries, options]);

  const clearError = useCallback(() => {
    setState({
      error: null,
      isRecovering: false,
      retryCount: 0,
      hasCriticalError: false
    });
  }, []);

  useEffect(() => {
    return () => {
      if (state.error && state.timestamp) {
        errorAnalytics.updateRecoveryStatus(state.timestamp, false, state.retryCount);
      }
    };
  }, [state.error, state.timestamp, state.retryCount]);

  return {
    ...state,
    handleError,
    clearError,
    errorRate: errorAnalytics.getErrorRate(),
    recoveryRate: errorAnalytics.getRecoveryRate(),
    severityDistribution: errorAnalytics.getSeverityDistribution()
  };
};