import React, { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { trackCTAClick } from '../utils/analytics';

interface WithFlowValidationProps {
  minTimePerQuestion?: number;
  onValidationFailed?: (reason: string) => void;
  onValidationSuccess?: () => void;
}

export function withFlowValidation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithFlowValidationProps = {}
) {
  return function WithFlowValidationWrapper(props: P) {
    const {
      minTimePerQuestion = 5000,
      onValidationFailed,
      onValidationSuccess
    } = options;

    const navigate = useNavigate();
    const location = useLocation();
    const { disableShortcuts, enableShortcuts } = useKeyboardShortcuts();
    const { elapsedTime, canProgress, isIdle } = useTimeTracker({
      minTime: minTimePerQuestion,
      onTimeUpdate: time => {
        // Re-enable shortcuts once minimum time is met
        if (time >= minTimePerQuestion) {
          enableShortcuts();
        }
      }
    });

    // Disable navigation shortcuts initially
    useEffect(() => {
      if (!canProgress) {
        disableShortcuts();
      }
    }, [canProgress, disableShortcuts]);

    const validateFlow = useCallback(async () => {
      if (!canProgress) {
        onValidationFailed?.(
          `Please spend at least ${Math.ceil(minTimePerQuestion / 1000)} seconds reviewing the question`
        );
        return false;
      }

      if (isIdle) {
        onValidationFailed?.('Please resume the assessment before continuing');
        return false;
      }

      trackCTAClick('assessment_progression');
      onValidationSuccess?.();
      return true;
    }, [
      canProgress,
      isIdle,
      minTimePerQuestion,
      onValidationFailed,
      onValidationSuccess
    ]);

    // Intercept navigation attempts
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!canProgress) {
          e.preventDefault();
          e.returnValue = '';
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [canProgress]);

    // Handle programmatic navigation
    useEffect(() => {
      const unblock = navigate((to, from) => {
        if (!canProgress) {
          onValidationFailed?.(
            `Please spend at least ${Math.ceil(minTimePerQuestion / 1000)} seconds reviewing the question`
          );
          return false;
        }
        return true;
      });

      return () => unblock();
    }, [navigate, canProgress, minTimePerQuestion, onValidationFailed]);

    return (
      <WrappedComponent
        {...props}
        validateFlow={validateFlow}
        elapsedTime={elapsedTime}
        canProgress={canProgress}
        isIdle={isIdle}
      />
    );
  };
}
