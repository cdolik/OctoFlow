import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export type StageType = 'assessment' | 'summary' | 'results';

interface SessionData {
  responses: Record<string, unknown>;
  timestamp: number;
  stage: StageType;
}

export interface SessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
  saveSession: (data: Partial<SessionData>) => void;
  restoreSession: () => SessionData | null;
  clearSession: () => void;
}

const SESSION_KEY = 'octoflow_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export function useSessionGuard(requiredStage: StageType): SessionGuardResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  const saveSession = useCallback((data: Partial<SessionData>) => {
    try {
      const existingData = sessionStorage.getItem(SESSION_KEY);
      const currentData: SessionData = existingData 
        ? JSON.parse(existingData)
        : { responses: {}, timestamp: Date.now(), stage: 'assessment' };

      const updatedData = {
        ...currentData,
        ...data,
        timestamp: Date.now()
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedData));
      sessionStorage.setItem('currentStage', updatedData.stage);

      // Update completed stages
      const completedStages = sessionStorage.getItem('completedStages');
      const completed = completedStages ? JSON.parse(completedStages) : [];
      if (!completed.includes(updatedData.stage)) {
        completed.push(updatedData.stage);
        sessionStorage.setItem('completedStages', JSON.stringify(completed));
      }

      // Backup to localStorage for recovery
      try {
        localStorage.setItem(`${SESSION_KEY}_backup`, JSON.stringify(updatedData));
      } catch (e) {
        console.warn('Failed to backup session to localStorage:', e);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);

  const restoreSession = useCallback((): SessionData | null => {
    try {
      // Try to get from sessionStorage first
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const data = JSON.parse(sessionData);
        if (Date.now() - data.timestamp < SESSION_TIMEOUT) {
          return data;
        }
      }

      // Try to recover from localStorage backup
      const backupData = localStorage.getItem(`${SESSION_KEY}_backup`);
      if (backupData) {
        const data = JSON.parse(backupData);
        if (Date.now() - data.timestamp < SESSION_TIMEOUT) {
          // Restore to sessionStorage
          sessionStorage.setItem(SESSION_KEY, backupData);
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('currentStage');
    sessionStorage.removeItem('completedStages');
    localStorage.removeItem(`${SESSION_KEY}_backup`);
  }, []);

  useEffect(() => {
    const checkSession = () => {
      try {
        const session = restoreSession();
        if (!session) {
          setIsAuthorized(false);
          navigate('/stage-select', { replace: true });
          return;
        }

        const stages: StageType[] = ['assessment', 'summary', 'results'];
        const currentIndex = stages.indexOf(session.stage);
        const requiredIndex = stages.indexOf(requiredStage);
        const completedStages = sessionStorage.getItem('completedStages');
        const completedArray = completedStages ? JSON.parse(completedStages) : [];

        setIsAuthorized(
          currentIndex >= requiredIndex && 
          (requiredIndex === 0 || completedArray.includes(stages[requiredIndex - 1]))
        );
      } catch (error) {
        console.error('Session check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up periodic session checks
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [requiredStage, navigate, restoreSession]);

  return { 
    isLoading, 
    isAuthorized, 
    saveSession, 
    restoreSession,
    clearSession 
  };
}