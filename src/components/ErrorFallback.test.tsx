import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorFallback from './ErrorFallback';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

jest.mock('../hooks/useErrorManagement');
jest.mock('../hooks/useKeyboardNavigation');

describe('ErrorFallback', () => {
  const mockError = new Error('Test error');
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useErrorManagement as jest.Mock).mockReturnValue({
      isRecovering: false,
      retryCount: 0,
      handleError: jest.fn(),
      canRetry: true
    });
    (useKeyboardNavigation as jest.Mock).mockReturnValue({
      shortcuts: []
    });
  });

  it('renders error message and retry button', () => {
    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });

  it('shows loading spinner during recovery', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      isRecovering: true,
      retryCount: 1,
      handleError: jest.fn(),
      canRetry: true
    });

    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Attempting to recover/i)).toBeInTheDocument();
  });

  it('handles storage errors differently', async () => {
    const storageError = new Error('storage error');
    const handleError = jest.fn();
    (useErrorManagement as jest.Mock).mockReturnValue({
      isRecovering: false,
      retryCount: 0,
      handleError,
      canRetry: true
    });

    render(
      <ErrorFallback 
        error={storageError}
        resetError={mockReset}
      />
    );

    fireEvent.click(screen.getByText(/Try Again/i));

    expect(handleError).toHaveBeenCalledWith(storageError);
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('shows retry count when attempts made', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      isRecovering: false,
      retryCount: 2,
      handleError: jest.fn(),
      canRetry: true
    });

    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    expect(screen.getByText(/Recovery attempts: 2/i)).toBeInTheDocument();
  });

  it('shows restart button when retries exhausted', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      isRecovering: false,
      retryCount: 3,
      handleError: jest.fn(),
      canRetry: false
    });

    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    expect(screen.getByText(/Restart Assessment/i)).toBeInTheDocument();
  });

  it('shows technical details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('maintains proper ARIA attributes', () => {
    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('handles keyboard shortcut for retry', () => {
    const handleError = jest.fn();
    (useErrorManagement as jest.Mock).mockReturnValue({
      isRecovering: false,
      retryCount: 0,
      handleError,
      canRetry: true
    });

    render(
      <ErrorFallback 
        error={mockError}
        resetError={mockReset}
      />
    );

    // Verify keyboard shortcut registration
    expect(useKeyboardNavigation).toHaveBeenCalledWith(
      expect.objectContaining({
        shortcuts: expect.arrayContaining([
          expect.objectContaining({
            key: 'r',
            allowInErrorState: true
          })
        ])
      })
    );
  });
});