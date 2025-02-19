import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type StageType = 'assessment' | 'summary' | 'results';

export interface SessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
}

export function useSessionGuard(requiredStage: StageType): SessionGuardResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      try {
        const currentStage = sessionStorage.getItem('currentStage');
        const completedStages = sessionStorage.getItem('completedStages');
        
        if (!currentStage) {
          setIsAuthorized(false);
          navigate('/stage-select', { replace: true });
          return;
        }

        const stages: StageType[] = ['assessment', 'summary', 'results'];
        const completedArray = completedStages ? JSON.parse(completedStages) as StageType[] : [];
        const currentIndex = stages.indexOf(currentStage as StageType);
        const requiredIndex = stages.indexOf(requiredStage);

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
  }, [requiredStage, navigate]);

  return { isLoading, isAuthorized };
}