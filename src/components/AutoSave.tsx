import React, { useEffect, useState } from 'react';
import { useStorage } from '../hooks/useStorage';

interface AutoSaveProps {
  onSaveComplete?: () => void;
  interval?: number;
}

export const AutoSave: React.FC<AutoSaveProps> = ({
  onSaveComplete,
  interval = 30000 // Default to 30 seconds
}) => {
  const { state, saveState } = useStorage();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state) return;

    const autoSaveTimer = setInterval(async () => {
      if (!saving && state) {
        setSaving(true);
        try {
          const success = await saveState(state);
          if (success) {
            setLastSaved(new Date());
            onSaveComplete?.();
          }
        } finally {
          setSaving(false);
        }
      }
    }, interval);

    return () => clearInterval(autoSaveTimer);
  }, [state, saving, interval, saveState, onSaveComplete]);

  return (
    <div className="auto-save-status" aria-live="polite">
      {saving ? (
        <span>Saving...</span>
      ) : lastSaved ? (
        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
      ) : null}
    </div>
  );
};
