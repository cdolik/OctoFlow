import React, { useEffect, useCallback } from 'react';
import type { Responses } from './withFlowValidation';

interface AutoSaveProps {
  data: Responses;
  onSave: (data: Responses) => Promise<void>;
  interval?: number;
  onError?: (error: Error) => void;
}

const AutoSave: React.FC<AutoSaveProps> = ({
  data,
  onSave,
  interval = 5000,
  onError
}) => {
  const save = useCallback(async () => {
    try {
      await onSave(data);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, onSave, onError]);

  useEffect(() => {
    const timer = setInterval(save, interval);
    return () => clearInterval(timer);
  }, [save, interval]);

  return null;
};

export default AutoSave;
