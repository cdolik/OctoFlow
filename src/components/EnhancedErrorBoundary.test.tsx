import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
import { ErrorProvider } from '../contexts/ErrorContext';
import { ValidationFailedError } from '../utils/errorHandling';
import { useAudioFeedback } from './AudioFeedback';
import { trackError } from '../utils/analytics';

jest.mock('./AudioFeedback');
jest.mock('../utils/analytics');

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
  const mockPlaySound = jest.fn();

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
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

  it('shows error UI and plays error sound when error occurs', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <Wrapper>
        <EnhancedErrorBoundary>
          <ThrowError message="Test error" />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('error');

    consoleError.mockRestore();
  });

  it('tracks errors with analytics', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <Wrapper>
        <EnhancedErrorBoundary component="TestComponent">
          <ThrowError message="Analytics test error" />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(trackError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'TestComponent'
      })
    );

    consoleError.mockRestore();
  });

  it('handles retry attempts with audio feedback', () => {
    const mockOnRecover = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Wrapper>
        <EnhancedErrorBoundary onRecover={mockOnRecover} maxRetries={2}>
          <ThrowError message="Retry test error" />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    // First retry
    fireEvent.click(screen.getByText('Try Again'));
    expect(mockPlaySound).toHaveBeenCalledWith('info');
    expect(mockOnRecover).toHaveBeenCalled();

    // Second retry (max reached)
    act(() => {
      // Simulate error after retry
      render(
        <Wrapper>
          <EnhancedErrorBoundary onRecover={mockOnRecover} maxRetries={2}>
            <ThrowError message="Retry test error" />
          </EnhancedErrorBoundary>
        </Wrapper>
      );
    });

    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenLastCalledWith('error');

    consoleError.mockRestore();
  });

  it('maintains retry count across retries', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Wrapper>
        <EnhancedErrorBoundary maxRetries={3}>
          <ThrowError message="Retry count test error" />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toHaveAttribute('aria-label', 'Retry (Attempt 1 of 3)');

    fireEvent.click(retryButton);
    
    // Re-render to simulate error after retry
    render(
      <Wrapper>
        <EnhancedErrorBoundary maxRetries={3}>
          <ThrowError message="Retry count test error" />
        </EnhancedErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText('Try Again')).toHaveAttribute('aria-label', 'Retry (Attempt 2 of 3)');

    consoleError.mockRestore();
  });

  it('renders fallback UI on error', () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowError />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('calls onRecover when recovery button is clicked', () => {
    const onRecover = jest.fn();
    render(
      <EnhancedErrorBoundary onRecover={onRecover}>
        <ThrowError />
      </EnhancedErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(onRecover).toHaveBeenCalled();
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom Error UI</div>;
    render(
      <EnhancedErrorBoundary fallback={fallback}>
        <ThrowError />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
});