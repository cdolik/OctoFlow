import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';
import { useStorageErrorHandler } from '../hooks/useStorageErrorHandler';
import { trackError } from '../utils/analytics';

jest.mock('../hooks/useStorageErrorHandler');
jest.mock('../utils/analytics');

const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('AssessmentErrorBoundary', () => {
  const mockStorageHandler = {
    isRecovering: false,
    lastError: null,
    retryCount: 0,
    handleStorageError: jest.fn().mockResolvedValue(true),
    canRetry: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorageErrorHandler as jest.Mock).mockReturnValue(mockStorageHandler);
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
});