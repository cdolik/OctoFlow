import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssessmentState, clearAssessmentState } from '../utils/storage';
import { trackError } from '../utils/analytics';
import { UseSessionGuardConfig, UseSessionGuardResult } from '../types/hooks';

export const useSessionGuard = ({
  redirectPath = '/',
  requireAuth = true,
  persistSession = true
}: Partial<UseSessionGuardConfig> = {}): UseSessionGuardResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const renewSession = async () => {
    try {
      const state = getAssessmentState();
      if (!state && requireAuth) {
        setIsAuthorized(false);
        navigate(redirectPath, { replace: true });
        return;
      }
      setIsAuthorized(true);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Session renewal failed');
      setError(error);
      trackError(error, {
        source: 'useSessionGuard',
        recoveryAttempted: true,
        recoverySuccessful: false
      });
      setIsAuthorized(false);
      navigate(redirectPath, { replace: true });
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const state = getAssessmentState();
        
        if (!state && requireAuth) {
          setIsAuthorized(false);
          navigate(redirectPath, { replace: true });
          return;
        }

        if (state && !persistSession) {
          clearAssessmentState();
          setIsAuthorized(false);
          navigate(redirectPath, { replace: true });
          return;
        }

        setIsAuthorized(true);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Session validation failed');
        setError(error);
        trackError(error, {
          source: 'useSessionGuard',
          recoveryAttempted: true,
          recoverySuccessful: false
        });
        setIsAuthorized(false);
        navigate(redirectPath, { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [redirectPath, requireAuth, persistSession, navigate]);

  return { isLoading, isAuthorized, error, renewSession };
};