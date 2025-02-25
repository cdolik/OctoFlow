import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';

const AllTheProviders = ({ children }: PropsWithChildren) => {
  return (
    <MemoryRouter>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </MemoryRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };