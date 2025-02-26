import { useState, useCallback, useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';

interface TimeTrackerOptions {
  onTimeUpdate?: (time: number) => void;
  minTime?: number;
  idleTimeout?: number;
  /** Optional callback when timer becomes idle */
  onIdle?: () => void;
  /** Optional callback when timer resumes from idle */
  onResume?: () => void;
}

interface TimeTrackerState {
  elapsedTime: number;
  isIdle: boolean;
  canProgress: boolean;
}

export const useTimeTracker = ({
  onTimeUpdate,
  minTime = 1000, // Minimum time in ms before allowing progression
  idleTimeout = 30000, // Time in ms before considering user idle
  onIdle,
  onResume
}: TimeTrackerOptions = {}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const { disableShortcuts, enableShortcuts } = useKeyboardShortcuts();

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isIdle) {
      onResume?.();
    }

    setIsIdle(false);
    enableShortcuts();

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      disableShortcuts();
      onIdle?.();
    }, idleTimeout);
  }, [idleTimeout, disableShortcuts, enableShortcuts, isIdle, onIdle, onResume]);

  useEffect(() => {
    const updateTimer = () => {
      if (!isIdle) {
        const currentTime = Date.now();
        const newElapsedTime = currentTime - startTimeRef.current;
        setElapsedTime(newElapsedTime);
        onTimeUpdate?.(newElapsedTime);
      }
    };

    const interval = setInterval(updateTimer, 1000);
    const handleActivity = () => resetIdleTimer();

    // Track user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('focus', handleActivity);

    // Initial idle timer
    resetIdleTimer();

    return () => {
      clearInterval(interval);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('focus', handleActivity);
    };
  }, [isIdle, onTimeUpdate, resetIdleTimer]);

  const reset = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const pause = useCallback(() => {
    setIsIdle(true);
    disableShortcuts();
  }, [disableShortcuts]);

  const resume = useCallback(() => {
    setIsIdle(false);
    enableShortcuts();
    resetIdleTimer();
  }, [enableShortcuts, resetIdleTimer]);

  const canProgress = elapsedTime >= minTime;

  const state: TimeTrackerState = {
    elapsedTime,
    isIdle,
    canProgress
  };

  return {
    ...state,
    reset,
    pause,
    resume
  };
};