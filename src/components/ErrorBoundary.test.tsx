import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import { validateStorageState } from '../utils/storageValidation';
import { trackError } from '../utils/analytics';

jest.mock('../utils/analytics');
jest.mock('../utils/storageValidation');

describe('ErrorBoundary', () => {
  const mockOnRecovery = jest.fn();
  const mockOnReset = jest.fn();

  const ThrowError: React.FC<{ message: string }> = ({ message }) => {
    throw new Error(message);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress console.error for clean test output
    (validateStorageState as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
  });

  it('renders children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div data-testid="child">Test Content</div>
      </ErrorBoundary>
    );

    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  });

  it('shows error UI when an error occurs', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('shows recovery option for storage errors', () => {
    render(
      <ErrorBoundary onRecovery={mockOnRecovery}>
        <ThrowError message="localStorage error occurred" />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /Try to Resume/i })).toBeInTheDocument();
  });

  it('attempts recovery up to 3 times', async () => {
    mockOnRecovery.mockRejectedValue(new Error('Recovery failed'));

    render(
      <ErrorBoundary onRecovery={mockOnRecovery}>
        <ThrowError message="storage error" />
      </ErrorBoundary>
    );

    // First attempt
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Try to Resume/i }));
    });

    // Second attempt
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Try to Resume/i }));
    });

    // Third attempt
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Try to Resume/i }));
    });

    // Recovery button should no longer be available
    expect(screen.queryByRole('button', { name: /Try to Resume/i })).not.toBeInTheDocument();
    expect(mockOnRecovery).toHaveBeenCalledTimes(3);
  });

  it('validates storage state before recovery attempt', async () => {
    const invalidState = { invalid: 'state' };
    sessionStorage.setItem('octoflow', JSON.stringify(invalidState));
    (validateStorageState as jest.Mock).mockReturnValue({ 
      isValid: false, 
      errors: ['Invalid state format'] 
    });

    render(
      <ErrorBoundary onRecovery={mockOnRecovery}>
        <ThrowError message="storage error" />
      </ErrorBoundary>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Try to Resume/i }));
    });

    expect(trackError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        context: 'error_recovery'
      })
    );
  });

  it('resets error state on successful recovery', async () => {
    mockOnRecovery.mockResolvedValueOnce(undefined);

    render(
      <ErrorBoundary onRecovery={mockOnRecovery}>
        <ThrowError message="storage error" />
      </ErrorBoundary>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Try to Resume/i }));
    });

    expect(mockOnRecovery).toHaveBeenCalled();
    expect(screen.queryByText(/storage error/)).not.toBeInTheDocument();
  });

  it('uses custom fallback component when provided', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>Custom Error: {error.message}</div>
    );

    render(
      <ErrorBoundary fallbackComponent={CustomFallback}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Custom Error: Test error/)).toBeInTheDocument();
  });
});
