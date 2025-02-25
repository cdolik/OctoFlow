import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LiveRegion } from './LiveRegion';
import { useStorage } from '../hooks/useStorage';
import type { NavigationGuardProps } from '../types/props';
import type { StorageState } from '../types/storage';

export const NavigationGuard: React.FC<NavigationGuardProps> = ({
  when,
  message = 'Are you sure you want to leave? You have unsaved changes.',
  onBeforeUnload,
  children
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useStorage();

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (!when) return;
    if (onBeforeUnload && !onBeforeUnload()) return;
    
    event.preventDefault();
    event.returnValue = message;
    return message;
  }, [when, message, onBeforeUnload]);

  const saveLocationToState = useCallback(async (state: StorageState | null) => {
    if (!state) return;
    const updatedState = {
      ...state,
      metadata: {
        ...state.metadata,
        lastLocation: location.pathname
      }
    };
    await localStorage.setItem('lastLocation', location.pathname);
    return updatedState;
  }, [location]);

  useEffect(() => {
    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [when, handleBeforeUnload]);

  useEffect(() => {
    if (!when) return;

    const unblock = () => {
      const shouldBlock = when && (!onBeforeUnload || onBeforeUnload());
      if (!shouldBlock) return true;

      if (window.confirm(message)) {
        saveLocationToState(state);
        return true;
      }
      return false;
    };

    return () => {
      if (unblock) unblock();
    };
  }, [when, message, onBeforeUnload, navigate, saveLocationToState, state]);

  return (
    <>
      {children}
      {when && (
        <LiveRegion aria-live="polite">
          Navigation may be blocked due to unsaved changes
        </LiveRegion>
      )}
    </>
  );
};