import React, { useEffect, useCallback, useState } from 'react';
import debounce from 'lodash/debounce';

interface AutoSaveProps {
  data: any;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  interval?: number;
  onError?: (error: Error) => void;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AutoSave: React.FC<AutoSaveProps> = ({ 
  data, 
  onSave, 
  interval = 30000,
  onError 
}) => {
  const [status, setStatus] = useState<SaveStatus>('idle');

  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      try {
        setStatus('saving');
        await onSave(data);
        setStatus('saved');
      } catch (error) {
        setStatus('error');
        onError?.(error as Error);
      }
    }, interval),
    [onSave, interval, onError]
  );

  useEffect(() => {
    if (data) {
      debouncedSave(data);
    }
    return () => {
      debouncedSave.flush();
    };
  }, [data, debouncedSave]);

  return null;
};

export default AutoSave;