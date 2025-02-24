import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import { Stage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface StageTransitionProps {
  fromStage: Stage;
  toStage: Stage;
  onTransitionComplete?: () => void;
  onTransitionFail?: (error: Error) => void;
  progressData?: {
    fromStageProgress: number;
    toStageProgress: number;
  };
  children?: React.ReactNode;
}

export function StageTransition({
  fromStage,
  toStage,
  onTransitionComplete,
  onTransitionFail,
  progressData,
  children
}: StageTransitionProps): JSX.Element {
  const navigate = useNavigate();
  const { playSound } = useAudioFeedback();
  const [transitionState, setTransitionState] = useState<'preparing' | 'transitioning' | 'completing' | 'done' | 'error'>('preparing');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const handleTransition = useCallback(async () => {
    try {
      // Preparing phase
      setTransitionState('preparing');
      setProgress(0);
      playSound('info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Transitioning phase
      setTransitionState('transitioning');
      setProgress(50);
      playSound('navigation');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Completing phase
      setTransitionState('completing');
      setProgress(90);
      
      // Navigate to new stage
      navigate(`/assessment/${toStage}`);
      
      // Final completion
      setTransitionState('done');
      setProgress(100);
      playSound('complete');
      onTransitionComplete?.();
    } catch (err) {
      setTransitionState('error');
      setError(err as Error);
      playSound('error');
      onTransitionFail?.(err as Error);
    }
  }, [fromStage, toStage, navigate, playSound, onTransitionComplete, onTransitionFail]);

  useEffect(() => {
    handleTransition();
  }, [handleTransition]);

  const getTransitionMessage = () => {
    switch (transitionState) {
      case 'preparing':
        return `Preparing transition from ${fromStage} to ${toStage}`;
      case 'transitioning':
        return `Transitioning from ${fromStage} to ${toStage}`;
      case 'completing':
        return `Finalizing ${toStage} stage setup`;
      case 'done':
        return `Successfully transitioned to ${toStage}`;
      case 'error':
        return `Error transitioning to ${toStage}: ${error?.message}`;
      default:
        return '';
    }
  };

  const getProgressDescription = () => {
    if (!progressData) return '';
    return `${fromStage} progress: ${progressData.fromStageProgress}%, 
            ${toStage} progress: ${progressData.toStageProgress}%`;
  };

  if (transitionState === 'error') {
    return (
      <div role="alert" className="transition-error">
        <h2>Transition Failed</h2>
        <p>{error?.message}</p>
        <button 
          onClick={() => handleTransition()}
          className="retry-button"
        >
          Retry
        </button>
        <LiveRegion>
          {getTransitionMessage()}
        </LiveRegion>
        <style jsx>{`
          .transition-error {
            padding: 2rem;
            text-align: center;
            color: var(--error-text);
            background: var(--error-background);
            border-radius: 8px;
          }

          .retry-button {
            margin-top: 1rem;
            padding: 0.5rem 1.5rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .retry-button:hover {
            background: var(--primary-color-dark);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="stage-transition">
      <LoadingSpinner
        size="large"
        message={getTransitionMessage()}
        showProgress={true}
        progress={progress}
      />
      {progressData && (
        <div className="progress-info" role="status">
          <div className="stage-progress">
            <span className="stage-label">{fromStage}:</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressData.fromStageProgress}%` }}
              />
            </div>
          </div>
          <div className="stage-progress">
            <span className="stage-label">{toStage}:</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressData.toStageProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
      <LiveRegion>
        {`${getTransitionMessage()}. ${getProgressDescription()}`}
      </LiveRegion>
      {children}

      <style jsx>{`
        .stage-transition {
          padding: 2rem;
          text-align: center;
        }

        .progress-info {
          margin-top: 2rem;
        }

        .stage-progress {
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stage-label {
          min-width: 100px;
          text-align: right;
          color: var(--text-secondary);
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: var(--progress-track);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--progress-fill);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}