import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorRecovery } from '../hooks/useErrorRecovery';

interface ErrorContextType {
  attempts: number;
  errors: string[];
  canAttemptRecovery: () => boolean;
  recordAttempt: (error: Error) => void;
  resetRecovery: () => void;
  getRemainingCooldown: () => number;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  maxAttempts?: number;
  cooldownPeriod?: number;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxAttempts,
  cooldownPeriod
}) => {
  const errorRecovery = useErrorRecovery({
    maxAttempts,
    cooldownPeriod
  });

  return (
    <ErrorContext.Provider value={errorRecovery}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};