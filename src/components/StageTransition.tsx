import React, { useState, useEffect } from 'react';
import { LiveRegion } from './LiveRegion';
import type { Stage } from '../types';

interface StageTransitionProps {
  from: Stage;
  to: Stage;
  onTransitionComplete: () => void;
  duration?: number;
}

export const StageTransition: React.FC<StageTransitionProps> = ({
  from,
  to,
  onTransitionComplete,
  duration = 1000
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'start' | 'middle' | 'end'>('start');

  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(elapsed / duration, 1);
      setProgress(currentProgress * 100);

      if (currentProgress < 0.5) {
        setCurrentPhase('start');
      } else if (currentProgress < 1) {
        setCurrentPhase('middle');
      } else {
        setCurrentPhase('end');
        onTransitionComplete();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, onTransitionComplete]);

  const getTransitionMessage = () => {
    switch (currentPhase) {
      case 'start':
        return `Transitioning from ${from} stage`;
      case 'middle':
        return `Moving to ${to} stage`;
      case 'end':
        return `Completed transition to ${to} stage`;
      default:
        return '';
    }
  };

  return (
    <div className="stage-transition" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <LiveRegion>
        {getTransitionMessage()}
      </LiveRegion>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="stage-labels">
        <span className="from-stage">{from}</span>
        <span className="to-stage">{to}</span>
      </div>
    </div>
  );
};