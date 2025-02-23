import { useState, useCallback, useEffect } from 'react';
import { trackError } from '../utils/analytics';

interface ErrorRecoveryState {
  attempts: number;
  lastAttempt: number;
  errors: string[];
}

interface UseErrorRecoveryOptions {
  maxAttempts?: number;
  cooldownPeriod?: number;
  persistKey?: string;
}

export const useErrorRecovery = ({
  maxAttempts = 3,
  cooldownPeriod = 5 * 60 * 1000, // 5 minutes
  persistKey = 'octoflow_error_recovery'
}: UseErrorRecoveryOptions = {}) => {
  const [state, setState] = useState<ErrorRecoveryState>(() => {
    try {
      const saved = sessionStorage.getItem(persistKey);
      return saved ? JSON.parse(saved) : { attempts: 0, lastAttempt: 0, errors: [] };
    } catch {
      return { attempts: 0, lastAttempt: 0, errors: [] };
    }
  });

  const persistState = useCallback((newState: ErrorRecoveryState) => {
    try {
      sessionStorage.setItem(persistKey, JSON.stringify(newState));
    } catch (error) {
      trackError(error instanceof Error ? error : new Error('Failed to persist error state'));
    }
  }, [persistKey]);

  const recordAttempt = useCallback((error: Error) => {
    setState(prev => {
      const newState = {
        attempts: prev.attempts + 1,
        lastAttempt: Date.now(),
        errors: [...prev.errors, error.message]
      };
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  const canAttemptRecovery = useCallback(() => {
    const timeSinceLastAttempt = Date.now() - state.lastAttempt;
    return state.attempts < maxAttempts || timeSinceLastAttempt > cooldownPeriod;
  }, [state.attempts, state.lastAttempt, maxAttempts, cooldownPeriod]);

  const resetRecovery = useCallback(() => {
    const newState = { attempts: 0, lastAttempt: 0, errors: [] };
    setState(newState);
    persistState(newState);
  }, [persistState]);

  const getRemainingCooldown = useCallback(() => {
    if (state.attempts < maxAttempts) return 0;
    const elapsed = Date.now() - state.lastAttempt;
    return Math.max(0, cooldownPeriod - elapsed);
  }, [state.attempts, state.lastAttempt, maxAttempts, cooldownPeriod]);

  useEffect(() => {
    // Clean up old recovery state if cooldown period has passed
    const checkCooldown = () => {
      if (getRemainingCooldown() === 0 && state.attempts >= maxAttempts) {
        resetRecovery();
      }
    };

    const timer = setInterval(checkCooldown, 1000);
    return () => clearInterval(timer);
  }, [state.attempts, getRemainingCooldown, maxAttempts, resetRecovery]);

  return {
    attempts: state.attempts,
    errors: state.errors,
    canAttemptRecovery,
    recordAttempt,
    resetRecovery,
    getRemainingCooldown
  };
};