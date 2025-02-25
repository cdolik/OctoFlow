import React, { useEffect, useRef, useState } from 'react';
import type { SaveIndicatorProps } from '../types/props';
import { SaveIndicator } from './SaveIndicator';
import { useStorageErrorHandler } from '../hooks/useStorageErrorHandler';

interface AutoSaveProps {
  onSave: () => Promise<boolean>;
  interval?: number;
  validateBeforeSave?: () => boolean;
  children?: React.ReactNode;
}

export const AutoSave: React.FC<AutoSaveProps> = ({
  onSave,
  interval = 30000,
  validateBeforeSave,
  children
}) => {
  const [saveState, setSaveState] = useState<SaveIndicatorProps['state']>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { handleError } = useStorageErrorHandler();

  const performSave = async () => {
    if (validateBeforeSave && !validateBeforeSave()) {
      return;
    }

    try {
      setSaveState('saving');
      const success = await onSave();
      
      if (success) {
        setSaveState('saved');
        setLastSaved(new Date());
      } else {
        setSaveState('error');
      }
    } catch (error) {
      setSaveState('error');
      if (error instanceof Error) {
        handleError(error, {
          component: 'AutoSave',
          action: 'save',
          message: 'Failed to auto-save',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  useEffect(() => {
    const scheduleNextSave = () => {
      timeoutRef.current = setTimeout(async () => {
        await performSave();
        scheduleNextSave();
      }, interval);
    };

    scheduleNextSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [interval]);

  // Handle beforeunload to save before closing
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      event.preventDefault();
      await performSave();
      return undefined;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <>
      {children}
      <SaveIndicator state={saveState} lastSaved={lastSaved} />
    </>
  );
};
