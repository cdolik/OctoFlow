import React, { useEffect, useCallback, useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useError } from '../contexts/ErrorContext';
import { LiveRegion } from './LiveRegion';
import { SaveIndicator } from './SaveIndicator';

interface AutoSaveProps {
  children: React.ReactNode;
  interval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export function AutoSave({
  children,
  interval = 30000, // 30 seconds
  maxRetries = 3,
  retryDelay = 5000
}: AutoSaveProps): JSX.Element {
  const { state, saveState } = useStorage();
  const { handleError } = useError();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const performSave = useCallback(async () => {
    if (!state || saveStatus === 'saving') return;

    setSaveStatus('saving');
    try {
      const success = await saveState(state);
      if (success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        setRetryCount(0);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      setSaveStatus('error');
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          performSave();
        }, retryDelay * (retryCount + 1)); // Exponential backoff
      } else {
        handleError(error as Error);
      }
    }
  }, [state, saveState, handleError, maxRetries, retryDelay, retryCount, saveStatus]);

  // Regular auto-save interval
  useEffect(() => {
    const timer = setInterval(performSave, interval);
    return () => clearInterval(timer);
  }, [performSave, interval]);

  // Save on window blur (user switching tabs/apps)
  useEffect(() => {
    const handleBlur = () => {
      performSave();
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [performSave]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  const statusMessage = {
    idle: '',
    saving: 'Saving changes...',
    saved: `Changes saved ${lastSaved ? new Date(lastSaved).toLocaleTimeString() : ''}`,
    error: `Save failed. Retrying... (Attempt ${retryCount + 1}/${maxRetries})`
  }[saveStatus];

  return (
    <>
      <SaveIndicator 
        status={saveStatus}
        lastSaved={lastSaved}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
      <LiveRegion>
        {statusMessage}
      </LiveRegion>
      {children}
    </>
  );
}
