import React, { useState, useEffect, useCallback } from 'react';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';

interface TimerProps {
  duration?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  onComplete?: () => void;
  onWarning?: () => void;
  onCritical?: () => void;
  autoStart?: boolean;
  showRemaining?: boolean;
}

export function Timer({
  duration = 1800000, // 30 minutes default
  warningThreshold = 300000, // 5 minutes
  criticalThreshold = 60000, // 1 minute
  onComplete,
  onWarning,
  onCritical,
  autoStart = true,
  showRemaining = true
}: TimerProps): JSX.Element {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [warningIssued, setWarningIssued] = useState(false);
  const [criticalIssued, setCriticalIssued] = useState(false);
  const { playSound } = useAudioFeedback();

  const formatTime = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getTimeDescription = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;
  }, []);

  const handleTick = useCallback(() => {
    setTimeRemaining(prev => {
      const next = prev - 1000;

      // Handle warning threshold
      if (!warningIssued && next <= warningThreshold) {
        setWarningIssued(true);
        playSound('info');
        onWarning?.();
      }

      // Handle critical threshold
      if (!criticalIssued && next <= criticalThreshold) {
        setCriticalIssued(true);
        playSound('error');
        onCritical?.();
      }

      // Handle completion
      if (next <= 0) {
        setIsRunning(false);
        playSound('complete');
        onComplete?.();
        return 0;
      }

      return next;
    });
  }, [
    warningIssued, criticalIssued, warningThreshold, 
    criticalThreshold, onWarning, onCritical, onComplete, 
    playSound
  ]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      intervalId = setInterval(handleTick, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeRemaining, handleTick]);

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
    playSound('navigation');
  };

  const resetTimer = () => {
    setTimeRemaining(duration);
    setWarningIssued(false);
    setCriticalIssued(false);
    setIsRunning(false);
    playSound('info');
  };

  const timerState = timeRemaining <= criticalThreshold ? 'critical' 
    : timeRemaining <= warningThreshold ? 'warning' 
    : 'normal';

  return (
    <div className={`timer ${timerState}`} role="timer" aria-live="polite">
      <div className="timer-display">
        <span className="time">
          {formatTime(timeRemaining)}
        </span>
        <div className="timer-controls">
          <button
            onClick={toggleTimer}
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            className="control-button"
          >
            {isRunning ? '⏸' : '▶️'}
          </button>
          <button
            onClick={resetTimer}
            aria-label="Reset timer"
            className="control-button"
          >
            🔄
          </button>
        </div>
      </div>
      {showRemaining && (
        <div className="progress-bar" role="progressbar" 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-valuenow={Math.round((timeRemaining / duration) * 100)}
        >
          <div 
            className="progress-fill"
            style={{ width: `${(timeRemaining / duration) * 100}%` }}
          />
        </div>
      )}
      <LiveRegion>
        {isRunning ? getTimeDescription(timeRemaining) : 'Timer paused'}
      </LiveRegion>

      <style jsx>{`
        .timer {
          padding: 1rem;
          border-radius: 8px;
          background: var(--surface-background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .timer.warning {
          background: var(--warning-background);
        }

        .timer.critical {
          background: var(--error-background);
          animation: pulse 1s ease-in-out infinite;
        }

        .timer-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .time {
          font-size: 1.5rem;
          font-weight: 600;
          font-family: monospace;
        }

        .timer-controls {
          display: flex;
          gap: 0.5rem;
        }

        .control-button {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .control-button:hover {
          background: var(--surface-background-hover);
        }

        .progress-bar {
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

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .time {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}