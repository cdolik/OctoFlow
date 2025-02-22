import { useState, useEffect, useCallback } from 'react';
import { useSessionGuard } from './useSessionGuard';
import { useStateRecovery } from './useStateRecovery';
import { Stage } from '../types';
import { trackSessionRecovery } from '../utils/analytics';

interface UseAssessmentSessionConfig {
  redirectPath?: string;
  autoRecover?: boolean;
  onRecoveryComplete?: (stage: Stage, responses: Record<string, number>) => void;
}

interface UseAssessmentSessionResult {
  isLoading: boolean;
  isAuthorized: boolean;
  recoveredStage: Stage | null;
  recoveredResponses: Record<string, number>;
  error: Error | null;
  restoreSession: () => Promise<boolean>;
  clearSession: () => void;
}

export const useAssessmentSession = ({
  redirectPath = '/',
  autoRecover = true,
  onRecoveryComplete
}: UseAssessmentSessionConfig = {}): UseAssessmentSessionResult => {
  const [hasAttemptedRecovery, setHasAttemptedRecovery] = useState(false);
  const { isLoading: isSessionLoading, isAuthorized, error: sessionError } = 
    useSessionGuard({ redirectPath, persistSession: true });
  const { 
    isRecovering,
    recoveredStage,
    recoveredResponses,
    error: recoveryError,
    attemptRecovery,
    clearRecoveredState
  } = useStateRecovery();

  const restoreSession = useCallback(async (): Promise<boolean> => {
    if (!isAuthorized) return false;

    try {
      const recovered = await attemptRecovery();
      if (recovered && recoveredStage && onRecoveryComplete) {
        onRecoveryComplete(recoveredStage, recoveredResponses);
      }
      trackSessionRecovery(recovered, !!recoveryError);
      return recovered;
    } catch (e) {
      return false;
    } finally {
      setHasAttemptedRecovery(true);
    }
  }, [
    isAuthorized,
    attemptRecovery,
    recoveredStage,
    recoveredResponses,
    onRecoveryComplete,
    recoveryError
  ]);

  useEffect(() => {
    if (autoRecover && isAuthorized && !hasAttemptedRecovery) {
      restoreSession().catch(console.error);
    }
  }, [autoRecover, isAuthorized, hasAttemptedRecovery, restoreSession]);

  const clearSession = useCallback(() => {
    clearRecoveredState();
    setHasAttemptedRecovery(false);
    sessionStorage.clear();
  }, [clearRecoveredState]);

  return {
    isLoading: isSessionLoading || isRecovering,
    isAuthorized,
    recoveredStage,
    recoveredResponses,
    error: sessionError || recoveryError,
    restoreSession,
    clearSession
  };
};