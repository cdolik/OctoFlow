import React, { useEffect, useState, useRef } from 'react';
import { LiveRegion } from './LiveRegion';

interface TimerProps {
  startTime?: number;
  onTimeUpdate?: (elapsedTime: number) => void;
  onTimeout?: () => void;
  duration?: number;
  isActive?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  startTime = Date.now(),
  onTimeUpdate,
  onTimeout,
  duration,
  isActive = true
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef(startTime);
  const lastTickRef = useRef(performance.now());

  const animate = (currentTime: number) => {
    if (!isActive) return;

    const deltaTime = currentTime - lastTickRef.current;
    lastTickRef.current = currentTime;

    const newElapsedTime = Math.floor((currentTime - startTimeRef.current) / 1000);
    
    if (newElapsedTime !== elapsedTime) {
      setElapsedTime(newElapsedTime);
      onTimeUpdate?.(newElapsedTime);

      if (duration && newElapsedTime >= duration) {
        onTimeout?.();
        return;
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeString = (): string => {
    if (duration) {
      const remaining = Math.max(0, duration - elapsedTime);
      return `Time remaining: ${formatTime(remaining)}`;
    }
    return `Time elapsed: ${formatTime(elapsedTime)}`;
  };

  return (
    <div className={`timer ${!isActive ? 'paused' : ''}`} role="timer">
      <LiveRegion aria-live="polite">
        {getTimeString()}
      </LiveRegion>
      <div className="timer-display" aria-hidden="true">
        {formatTime(duration ? Math.max(0, duration - elapsedTime) : elapsedTime)}
      </div>
    </div>
  );
};