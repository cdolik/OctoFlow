import React, { createContext, useContext } from 'react';
import { AssessmentError } from '../types/errors';
import { useErrorManagement } from '../hooks/useErrorManagement';

interface ErrorContextValue {
  error: AssessmentError | null;
  isRecovering: boolean;
  handleError: (error: unknown, recover?: () => Promise<boolean>) => Promise<boolean>;
  clearError: () => void;
  hasCriticalError: boolean;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const errorManagement = useErrorManagement();

  return (
    <ErrorContext.Provider value={errorManagement}>
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