import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StageType, SessionGuardResult } from './useSessionGuard.d';

/**
 * Hook to protect routes based on assessment state
 * @param {StageType} requiredStage - The stage being accessed
 * @returns {SessionGuardResult} The session guard state
 */
export function useSessionGuard(requiredStage: StageType): SessionGuardResult {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      try {
        const currentStage = sessionStorage.getItem('currentStage');
        const hasCompletedPreviousStage = sessionStorage.getItem('completedStages');
        
        if (!currentStage) {
          setIsAuthorized(false);
          return;
        }

        const completedStages = hasCompletedPreviousStage 
          ? JSON.parse(hasCompletedPreviousStage) 
          : [];

        const stages: StageType[] = ['assessment', 'summary', 'results'];
        const currentIndex = stages.indexOf(currentStage as StageType);
        const requiredIndex = stages.indexOf(requiredStage);

        setIsAuthorized(currentIndex >= requiredIndex && completedStages.includes(stages[requiredIndex - 1]));
      } catch (error) {
        console.error('Session check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [requiredStage]);

  return { isLoading, isAuthorized };
}