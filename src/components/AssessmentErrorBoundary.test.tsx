import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { AssessmentErrorBoundary } from './AssessmentErrorBoundary';
import { useStorageErrorHandler } from '../hooks/useStorageErrorHandler';
import { trackError } from '../utils/analytics';
import { errorReporter } from '../utils/errorReporting';

jest.mock('../hooks/useStorageErrorHandler');
jest.mock('../utils/analytics');
jest.mock('../utils/errorReporting', () => ({
  errorReporter: {
    report: jest.fn(),
    isRecoverable: jest.fn()
  }
}));

const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

const TestComponent: React.FC = () => {
  throw new Error('Test error');
};

const onRecover = jest.fn();

describe('AssessmentErrorBoundary', () => {
  const mockStorageHandler = {
    isRecovering: false,
    lastError: null,
    retryCount: 0,
    handleStorageError: jest.fn().mockResolvedValue(true),
    canRetry: true
  };

  const mockOnRecover = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorageErrorHandler as jest.Mock).mockReturnValue(mockStorageHandler);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('handles storage errors using the storage error handler', async () => {
    const onRecovery = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary onRecovery={onRecovery}>
        <ThrowError message="storage error occurred" />
      </AssessmentErrorBoundary>
    );

    const retryButton = screen.getByText(/Try to Recover/i);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockStorageHandler.handleStorageError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('shows loading state during recovery', () => {
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      ...mockStorageHandler,
      isRecovering: true
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText(/Attempting to recover your progress/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('shows retry count when available', () => {
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      ...mockStorageHandler,
      retryCount: 2,
      lastError: new Error('Previous error')
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText(/Recovery attempts: 2/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('shows start fresh button when retries exhausted', () => {
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      ...mockStorageHandler,
      canRetry: false
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText(/Start Fresh/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('tracks errors with context', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="test error" />
      </AssessmentErrorBoundary>
    );

    expect(trackError).toHaveBeenCalledWith('assessment_error', expect.objectContaining({
      error: 'test error',
      stack: expect.any(String)
    }));

    consoleError.mockRestore();
  });

  it('shows technical details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AssessmentErrorBoundary onRecovery={jest.fn()}>
        <ThrowError message="test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
    consoleError.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <AssessmentErrorBoundary>
        <div>Test Content</div>
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows error UI when error occurs', () => {
    const errorMessage = 'Test error message';
    
    render(
      <AssessmentErrorBoundary>
        <ThrowError message={errorMessage} />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onRecover when retry button is clicked', () => {
    render(
      <AssessmentErrorBoundary onRecover={mockOnRecover}>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockOnRecover).toHaveBeenCalled();
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom Error UI</div>;

    render(
      <AssessmentErrorBoundary fallback={fallback}>
        <ThrowError message="Test error" />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('reports errors to error reporter', () => {
    const errorMessage = 'Test error for reporting';

    render(
      <AssessmentErrorBoundary>
        <ThrowError message={errorMessage} />
      </AssessmentErrorBoundary>
    );

    expect(errorReporter.report).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: 'AssessmentErrorBoundary'
      })
    );
  });

  it('handles non-recoverable errors', () => {
    const nonRecoverableError = new Error('Non-recoverable error');
    Object.defineProperty(nonRecoverableError, 'recoverable', {
      value: false
    });

    render(
      <AssessmentErrorBoundary>
        <ThrowError message={nonRecoverableError.message} />
      </AssessmentErrorBoundary>
    );

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    render(
      <AssessmentErrorBoundary onRecover={onRecover}>
        <TestComponent />
      </AssessmentErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Assessment Error')).toBeInTheDocument();
  });

  it('calls onRecover when recovery button is clicked', () => {
    render(
      <AssessmentErrorBoundary onRecover={onRecover}>
        <TestComponent />
      </AssessmentErrorBoundary>
    );

    fireEvent.click(screen.getByText('Try to Recover'));
    expect(onRecover).toHaveBeenCalled();
  });
});