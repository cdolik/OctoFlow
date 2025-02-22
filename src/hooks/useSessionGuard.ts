import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UseSessionGuardConfig, UseSessionGuardResult } from '../types/hooks';
import { getAssessmentMetadata } from '../utils/storage';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useSessionGuard = ({
  redirectPath = '/',
  requireAuth = true,
  persistSession = false
}: UseSessionGuardConfig = {}): UseSessionGuardResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkSession = useCallback(async () => {
    try {
      const metadata = getAssessmentMetadata();
      const lastSaved = metadata?.lastSaved || 0;
      const sessionExpired = Date.now() - lastSaved > SESSION_TIMEOUT;

      if (!metadata || sessionExpired) {
        if (requireAuth) {
          // Use hash navigation
          navigate(redirectPath.startsWith('/') ? `#${redirectPath}` : redirectPath, {
            replace: true,
            state: { from: location }
          });
        }
        setIsAuthorized(false);
        return false;
      }

      setIsAuthorized(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Session check failed'));
      setIsAuthorized(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location, redirectPath, requireAuth]);

  const renewSession = useCallback(async () => {
    try {
      if (!persistSession) {
        throw new Error('Session persistence is disabled');
      }

      const metadata = getAssessmentMetadata();
      if (!metadata) {
        throw new Error('No session data found');
      }

      // Update session timestamp
      metadata.lastSaved = Date.now();
      sessionStorage.setItem('octoflow', JSON.stringify({ metadata }));
      
      setIsAuthorized(true);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Session renewal failed'));
      return false;
    }
  }, [persistSession]);

  useEffect(() => {
    checkSession();

    if (persistSession) {
      const interval = setInterval(checkSession, SESSION_TIMEOUT / 2);
      return () => clearInterval(interval);
    }
  }, [checkSession, persistSession]);

  return {
    isLoading,
    isAuthorized,
    error,
    renewSession
  };
};