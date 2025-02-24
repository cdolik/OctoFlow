import React, { useEffect, useCallback } from 'react';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import { Stage } from '../types';

interface ProgressTrackerProps {
  stage: Stage;
  currentStep: number;
  totalSteps: number;
  estimatedTimePerStep?: number;
  onMilestone?: (milestone: number) => void;
}

export function ProgressTracker({
  stage,
  currentStep,
  totalSteps,
  estimatedTimePerStep = 60,  // seconds
  onMilestone
}: ProgressTrackerProps): JSX.Element {
  const { playSound } = useAudioFeedback();
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  const getProgressStatus = useCallback((percent: number): string => {
    if (percent === 0) return 'Not started';
    if (percent < 25) return 'Just beginning';
    if (percent < 50) return 'Getting there';
    if (percent < 75) return 'Making progress';
    if (percent < 100) return 'Almost done';
    return 'Complete';
  }, []);

  const getTimeRemaining = useCallback((current: number, total: number): string => {
    const stepsRemaining = total - current;
    const timeRemaining = stepsRemaining * estimatedTimePerStep;
    
    if (timeRemaining < 60) {
      return `${timeRemaining} seconds`;
    }
    const minutes = Math.ceil(timeRemaining / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }, [estimatedTimePerStep]);

  // Handle milestone notifications
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    if (onMilestone && milestones.includes(progress)) {
      playSound('complete');
      onMilestone(progress);
    }
  }, [progress, onMilestone, playSound]);

  return (
    <div className="progress-tracker">
      <div className="progress-bar-container">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label={`Assessment progress for ${stage}`}
          className="progress-bar"
        >
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="progress-labels">
          <span className="progress-percentage">
            {progress}%
          </span>
          <span className="progress-status">
            {getProgressStatus(progress)}
          </span>
        </div>
      </div>

      <div className="progress-details">
        <span className="steps-count">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="time-estimate">
          Estimated time remaining: {getTimeRemaining(currentStep, totalSteps)}
        </span>
      </div>

      <LiveRegion>
        {`${getProgressStatus(progress)}. ${progress}% complete. 
          ${getTimeRemaining(currentStep, totalSteps)} remaining.`}
      </LiveRegion>

      <style jsx>{`
        .progress-tracker {
          padding: 1rem;
          background: var(--surface-background);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-bar-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 8px;
          background: var(--progress-track);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--progress-fill);
          border-radius: 4px;
          transition: width 0.3s ease-out;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.875rem;
        }

        .progress-percentage {
          font-weight: bold;
          color: var(--text-primary);
        }

        .progress-status {
          color: var(--text-secondary);
        }

        .progress-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .progress-details {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}