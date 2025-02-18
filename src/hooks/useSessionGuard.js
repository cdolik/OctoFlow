import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAssessmentData, getAssessmentResponses } from '../utils/storage';

/**
 * @typedef {'assessment' | 'summary' | 'results'} StageType
 */

/**
 * @typedef {Object} SessionGuardResult
 * @property {boolean} isLoading - Whether the guard is still checking the session
 * @property {boolean} isAuthorized - Whether the user is authorized to access the route
 */

/**
 * Hook to protect routes based on assessment state
 * @param {StageType} requiredStage - The stage being accessed
 * @returns {SessionGuardResult} The session guard state
 */
export function useSessionGuard(requiredStage) {
  // Type validation in development
  if (process.env.NODE_ENV === 'development') {
    const validStages = ['assessment', 'summary', 'results'];
    if (!validStages.includes(requiredStage)) {
      console.warn(`Invalid stage: ${requiredStage}. Must be one of: ${validStages.join(', ')}`);
    }
  }

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const assessmentData = getAssessmentData();
      const responses = getAssessmentResponses();
      
      switch (requiredStage) {
        case 'assessment':
          if (!assessmentData?.stage) {
            navigate('/stage-select', { replace: true });
            return;
          }
          break;
        case 'summary':
          if (!responses || Object.keys(responses).length === 0) {
            navigate('/assessment', { replace: true });
            return;
          }
          break;
        case 'results':
          if (!assessmentData?.scores) {
            navigate('/summary', { replace: true });
            return;
          }
          break;
        default:
          navigate('/', { replace: true });
          return;
      }
      
      setIsAuthorized(true);
    };

    checkSession();
    setIsLoading(false);
  }, [navigate, requiredStage]);

  return { isLoading, isAuthorized };
}

useSessionGuard.propTypes = {
  requiredStage: PropTypes.oneOf(['assessment', 'summary', 'results']).isRequired
};