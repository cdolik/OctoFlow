import React, { useEffect, useRef } from 'react';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import './styles.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showProgress?: boolean;
  progress?: number;
  color?: string;
  inline?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  color = 'var(--primary-color)',
  inline = false
}: LoadingSpinnerProps): JSX.Element {
  const { playSound } = useAudioFeedback();
  const lastProgressRef = useRef(progress);

  // Play sound when progress changes significantly
  useEffect(() => {
    if (!showProgress) return;

    const progressDiff = progress - lastProgressRef.current;
    if (progressDiff >= 25) {
      playSound('info');
      lastProgressRef.current = progress;
    } else if (progress === 100 && lastProgressRef.current !== 100) {
      playSound('complete');
      lastProgressRef.current = 100;
    }
  }, [progress, showProgress, playSound]);

  const spinnerSize = {
    small: 24,
    medium: 40,
    large: 64
  }[size];

  const getProgressMessage = () => {
    if (!showProgress) return message;
    return `${message} (${Math.round(progress)}% complete)`;
  };

  return (
    <div 
      className={`loading-spinner ${inline ? 'inline' : ''}`}
      role="status"
      aria-label={getProgressMessage()}
    >
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          className="spinner-track"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="10"
        />
        <circle
          className="spinner-progress"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="10"
          strokeDasharray={`${progress * 2.83}, 283`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="loading-text">
        {getProgressMessage()}
      </span>
      <LiveRegion>
        {getProgressMessage()}
      </LiveRegion>

      <style jsx>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
        }

        .loading-spinner.inline {
          display: inline-flex;
          flex-direction: row;
          padding: 0;
        }

        svg {
          animation: rotate 2s linear infinite;
        }

        .spinner-track {
          stroke: var(--spinner-track);
          opacity: 0.2;
        }

        .spinner-progress {
          stroke: ${color};
          transition: stroke-dasharray 0.3s ease;
        }

        .loading-text {
          color: var(--text-secondary);
          font-size: ${size === 'small' ? '0.875rem' : '1rem'};
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        .inline .loading-text {
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
}