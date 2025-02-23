import React, { useEffect, useMemo } from 'react';
import { useTimeTracker } from '../hooks/useTimeTracker';
import './styles.css';

interface TimerProps {
  minTime?: number;
  onTimeUpdate?: (time: number) => void;
  onMinTimeReached?: () => void;
}

const Timer: React.FC<TimerProps> = ({
  minTime = 1000,
  onTimeUpdate,
  onMinTimeReached
}) => {
  const {
    elapsedTime,
    isIdle,
    canProgress,
    resume
  } = useTimeTracker({
    minTime,
    onTimeUpdate
  });

  useEffect(() => {
    if (canProgress) {
      onMinTimeReached?.();
    }
  }, [canProgress, onMinTimeReached]);

  const formattedTime = useMemo(() => {
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [elapsedTime]);

  const remainingTime = useMemo(() => {
    if (canProgress) return 0;
    return Math.ceil((minTime - elapsedTime) / 1000);
  }, [canProgress, minTime, elapsedTime]);

  return (
    <div 
      className={`timer ${isIdle ? 'timer--idle' : ''}`}
      role="timer"
      aria-label="Question timer"
    >
      <div className="timer__display" aria-live="polite">
        {formattedTime}
      </div>
      
      {!canProgress && (
        <div 
          className="timer__progress"
          role="progressbar"
          aria-valuenow={Math.floor((elapsedTime / minTime) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div 
            className="timer__progress-bar"
            style={{ width: `${(elapsedTime / minTime) * 100}%` }}
          />
        </div>
      )}

      {isIdle && (
        <button
          className="timer__resume"
          onClick={resume}
          aria-label="Resume assessment"
        >
          Click to resume
        </button>
      )}

      {!canProgress && (
        <div className="timer__remaining" aria-live="polite">
          Please review for {remainingTime} more seconds
        </div>
      )}
    </div>
  );
};