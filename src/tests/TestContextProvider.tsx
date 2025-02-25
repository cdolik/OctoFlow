import React, { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { mockPreferences, mockStorageState } from './test-data';

interface TestContextProviderProps extends PropsWithChildren {
  initialRoute?: string;
  preferences?: typeof mockPreferences;
  storageState?: typeof mockStorageState;
}

export const TestContextProvider: React.FC<TestContextProviderProps> = ({
  children,
  initialRoute = '/',
  preferences = mockPreferences,
  storageState = mockStorageState
}) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </MemoryRouter>
  );
};

export function createWrapper(props: Omit<TestContextProviderProps, 'children'> = {}) {
  return ({ children }: PropsWithChildren) => (
    <TestContextProvider {...props}>{children}</TestContextProvider>
  );
}