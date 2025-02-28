import { useState, useCallback } from 'react';
import { useErrorManagement } from './useErrorManagement';
import { Stage } from '../types';
import { AssessmentError } from '../types/errors';

interface AsyncOptions {
  stage?: Stage;
  retryOnError?: boolean;
  maxRetries?: number;
}

export function useAsyncWithError<T>(options: AsyncOptions = {}) {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorManagement({
    stage: options.stage,
    maxRetries: options.maxRetries
  });

  const execute = useCallback(async <R = T>(
    asyncFn: () => Promise<R>,
    errorContext?: { action: string; component: string }
  ): Promise<R | null> => {
    setLoading(true);
    try {
      const result = await asyncFn();
      setLoading(false);
      return result;
    } catch (error) {
      const context = {
        ...errorContext,
        stage: options.stage,
        timestamp: new Date().toISOString()
      };

      let shouldRetry = options.retryOnError;
      
      if (error instanceof AssessmentError) {
        shouldRetry = error.recoverable && options.retryOnError;
      }

      const errorHandled = await handleError(
        error as Error,
        shouldRetry ? async () => {
          try {
            const retryResult = await asyncFn();
            setLoading(false);
            return true;
          } catch {
            return false;
          }
        } : undefined
      );

      if (!errorHandled) {
        setLoading(false);
      }
      
      return null;
    }
  }, [handleError, options.retryOnError, options.stage]);

  return {
    execute,
    loading
  };
}