import React, { useEffect } from 'react';
import { AssessmentSaveStatus } from '../types/assessment';
import SaveIndicator from './SaveIndicator';
import { useStorage } from '../hooks/useStorage';
import { trackError } from '../utils/analytics';

interface AutoSaveProps {
  data: unknown;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
  interval?: number;
  className?: string;
}

const AutoSave: React.FC<AutoSaveProps> = ({
  data,
  onSaveComplete,
  onSaveError,
  interval = 5000,
  className
}) => {
  const { 
    saveState,
    error: storageError,
    recoverFromBackup 
  } = useStorage({
    autoSave: true,
    backupInterval: interval
  });

  const [saveStatus, setSaveStatus] = React.useState<AssessmentSaveStatus>({
    status: 'saved',
    timestamp: Date.now()
  });

  useEffect(() => {
    const save = async () => {
      try {
        setSaveStatus({ status: 'saving' });
        await saveState(data);
        setSaveStatus({ 
          status: 'saved', 
          timestamp: Date.now() 
        });
        onSaveComplete?.();
      } catch (error) {
        const saveError = error instanceof Error ? error : new Error('Save failed');
        setSaveStatus({ 
          status: 'error',
          error: saveError
        });
        onSaveError?.(saveError);
        trackError(saveError);

        // Attempt recovery
        try {
          const recovered = await recoverFromBackup();
          if (recovered) {
            setSaveStatus({ 
              status: 'saved',
              timestamp: Date.now()
            });
          }
        } catch (recoveryError) {
          trackError(
            recoveryError instanceof Error ? recoveryError : new Error('Recovery failed')
          );
        }
      }
    };

    // Save immediately when data changes
    save();

    // Set up interval for periodic saves
    const timer = setInterval(save, interval);
    return () => clearInterval(timer);
  }, [data, interval, saveState, onSaveComplete, onSaveError, recoverFromBackup]);

  // Update save status if there's a storage error
  useEffect(() => {
    if (storageError) {
      setSaveStatus({ 
        status: 'error',
        error: storageError
      });
      onSaveError?.(storageError);
    }
  }, [storageError, onSaveError]);

  return <SaveIndicator status={saveStatus} className={className} />;
};

export default AutoSave;
