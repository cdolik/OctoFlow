import React, { useEffect, useRef, useCallback } from 'react';
import { useUserPreferences } from './UserPreferences';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';

interface WithAutoSaveProps {
  onSave: () => Promise<boolean>;
  isDirty?: boolean;
  validateBeforeSave?: () => boolean;
}

export function withAutoSave<P extends WithAutoSaveProps>(
  WrappedComponent: React.ComponentType<P>,
  displayName = 'WithAutoSave'
): React.FC<Omit<P, keyof WithAutoSaveProps>> {
  const WithAutoSaveComponent: React.FC<P> = (props) => {
    const { preferences } = useUserPreferences();
    const { playSound } = useAudioFeedback();
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveRef = useRef<Date | null>(null);
    const saveAttemptRef = useRef(0);

    const handleSave = useCallback(async () => {
      if (!props.isDirty) return;
      
      if (props.validateBeforeSave && !props.validateBeforeSave()) {
        playSound('error');
        return;
      }

      try {
        const success = await props.onSave();
        if (success) {
          lastSaveRef.current = new Date();
          saveAttemptRef.current = 0;
          playSound('success');
        } else {
          throw new Error('Save failed');
        }
      } catch (error) {
        playSound('error');
        saveAttemptRef.current++;

        // Retry with exponential backoff if under 3 attempts
        if (saveAttemptRef.current < 3) {
          const backoffTime = Math.pow(2, saveAttemptRef.current) * 1000;
          saveTimeoutRef.current = setTimeout(handleSave, backoffTime);
        }
      }
    }, [props, playSound]);

    // Setup auto-save interval
    useEffect(() => {
      if (!preferences.autoSave || !props.isDirty) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        return;
      }

      saveTimeoutRef.current = setTimeout(handleSave, preferences.autoSaveInterval);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [preferences.autoSave, preferences.autoSaveInterval, props.isDirty, handleSave]);

    // Save on window blur if changes are pending
    useEffect(() => {
      const handleBlur = () => {
        if (props.isDirty) {
          handleSave();
        }
      };

      window.addEventListener('blur', handleBlur);
      return () => window.removeEventListener('blur', handleBlur);
    }, [props.isDirty, handleSave]);

    // Save before unload if changes are pending
    useEffect(() => {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (props.isDirty) {
          event.preventDefault();
          event.returnValue = '';
          handleSave();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [props.isDirty, handleSave]);

    return (
      <>
        <WrappedComponent {...props} />
        {props.isDirty && preferences.autoSave && (
          <LiveRegion>
            {lastSaveRef.current
              ? `Last auto-saved at ${lastSaveRef.current.toLocaleTimeString()}`
              : 'Changes will be auto-saved'}
          </LiveRegion>
        )}
      </>
    );
  };

  WithAutoSaveComponent.displayName = displayName;
  return WithAutoSaveComponent as React.FC<Omit<P, keyof WithAutoSaveProps>>;
}