import React, { useEffect, useState } from 'react';
import { Stage } from '../types';
import { trackStageTransition } from '../utils/analytics';

interface StageTransitionProps {
  stage: Stage;
  nextStage: Stage | null;
  onTransitionComplete: () => void;
}

export const StageTransition: React.FC<StageTransitionProps> = ({
  stage,
  nextStage,
  onTransitionComplete
}) => {
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!transitioning && nextStage) {
      setTransitioning(true);
      trackStageTransition(stage, nextStage);
      
      // Simple transition delay before completing
      const timer = setTimeout(() => {
        setTransitioning(false);
        onTransitionComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [stage, nextStage, transitioning, onTransitionComplete]);

  if (!nextStage) return null;

  return (
    <div className="stage-transition" aria-live="polite">
      <div className="transition-content">
        {transitioning ? (
          <p>Transitioning from {stage} to {nextStage}...</p>
        ) : (
          <p>Ready to proceed to {nextStage}</p>
        )}
      </div>
    </div>
  );
};