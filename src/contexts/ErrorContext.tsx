import React, { createContext, useCallback, useContext, useState } from 'react';
import { AssessmentError, ErrorContext as ErrorContextType } from '../types/errors';
import { errorReporter } from '../utils/errorReporting';

interface ErrorState {
  error: Error | null;
  isRecovering: boolean;
  retryCount: number;
}

interface ErrorContextValue {
  error: Error | null;
  handleError: (error: Error, context?: ErrorContextType) => Promise<boolean>;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, setState] = useState<ErrorState>({
    error: null,
    isRecovering: false,
    retryCount: 0
  });

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      isRecovering: false
    }));
  }, []);

  const handleError = useCallback(async (error: Error, context?: ErrorContextType): Promise<boolean> => {
    if (state.isRecovering) {
      return false;
    }

    setState(prev => ({
      ...prev,
      error,
      isRecovering: true,
      retryCount: prev.retryCount + 1
    }));

    if (error instanceof AssessmentError) {
      const success = await errorReporter.report(error, {
        ...context,
        timestamp: new Date().toISOString()
      });

      if (!success) {
        setState(prev => ({
          ...prev,
          isRecovering: false
        }));
        return false;
      }
    }

    return true;
  }, [state.isRecovering]);

  const value = {
    error: state.error,
    handleError,
    clearError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};