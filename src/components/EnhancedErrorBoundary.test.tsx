import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { ErrorProvider } from '../contexts/ErrorContext';
import { ValidationFailedError } from '../utils/errorHandling';

// Test component that throws an error
const ThrowError: React.FC<{ error?: Error }> = ({ error }) => {
  throw error || new Error('Test error');
};

// Wrapper component with required providers
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <HashRouter>
    <ErrorProvider>
      {children}
    </ErrorProvider>
  </HashRouter>
);

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <Wrapper>
        <EnhancedErrorBoundary>
          <div>Test content</div>
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows error UI when error occurs', () => {
    render(
      <Wrapper>
        <EnhancedErrorBoundary>
          <ThrowError />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('handles recoverable assessment errors', async () => {
    const validationError = new ValidationFailedError(
      'test',
      'required',
      'Validation failed'
    );

    render(
      <Wrapper>
        <EnhancedErrorBoundary>
          <ThrowError error={validationError} />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
    expect(screen.getByText(/try to recover/i)).toBeInTheDocument();

    // Attempt recovery
    fireEvent.click(screen.getByText(/try to recover/i));

    await waitFor(() => {
      expect(screen.getByText(/attempting to recover/i)).toBeInTheDocument();
    });
  });

  it('allows starting over when error is not recoverable', () => {
    const unrecoverableError = new Error('Unrecoverable error');
    const mockClear = jest.spyOn(sessionStorage, 'clear');

    render(
      <Wrapper>
        <EnhancedErrorBoundary>
          <ThrowError error={unrecoverableError} />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    fireEvent.click(screen.getByText(/start over/i));

    expect(mockClear).toHaveBeenCalled();
    expect(window.location.hash).toBe('#/');
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <Wrapper>
        <EnhancedErrorBoundary fallback={customFallback}>
          <ThrowError />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('preserves error context in error boundary state', () => {
    const contextError = new ValidationFailedError(
      'responses',
      'required',
      'Missing responses'
    );
    contextError.context = { additionalInfo: 'test' };

    render(
      <Wrapper>
        <EnhancedErrorBoundary>
          <ThrowError error={contextError} />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText(/missing responses/i)).toBeInTheDocument();
  });
});