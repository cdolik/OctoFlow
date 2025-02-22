import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssessmentMetadata } from '../utils/storage';
import { Stage } from '../types';

interface UseSessionGuardProps {
  currentStage: Stage;
  onGuardComplete?: () => void;
}

export const useSessionGuard = ({ currentStage, onGuardComplete }: UseSessionGuardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const metadata = getAssessmentMetadata();
    if (metadata.currentStage !== currentStage) {
      navigate(`/assessment/${metadata.currentStage}`);
    } else {
      onGuardComplete?.();
    }
  }, [currentStage, navigate, onGuardComplete]);
};