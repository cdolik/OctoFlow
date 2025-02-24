import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorResult, AssessmentError, ErrorContext as ErrorContextType } from '../types/errors';
import { errorReporter } from '../utils/errorReporting';

interface ErrorContextValue {
  error: Error | null;
  handleError: (error: Error, context?: ErrorContextType) => Promise<ErrorResult>;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(async (error: Error, context?: ErrorContextType): Promise<ErrorResult> => {
    setError(error);
    const errorId = errorReporter.report(error, context);
    
    if (error instanceof Error && 'recoverable' in error) {
      const assessmentError = error as AssessmentError;
      if (!assessmentError.recoverable) {
        return { handled: true, recovered: false, error };
      }
    }

    try {
      // Attempt basic recovery
      setError(null);
      return { handled: true, recovered: true, error };
    } catch (recoveryError) {
      return { handled: true, recovered: false, error: recoveryError as Error };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, handleError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

export default ErrorContext;