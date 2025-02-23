import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ErrorProvider } from '../contexts/ErrorContext';
import ErrorFallback from './ErrorFallback';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

jest.mock('../hooks/useErrorManagement');
jest.mock('../hooks/useKeyboardNavigation');

describe('ErrorFallback', () => {
  const mockError = new Error('Test error');
  const mockReset = jest.fn();
  const mockResetError = jest.fn();
  const mockRecoverError = jest.fn();

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

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <ErrorProvider maxAttempts={3}>{ui}</ErrorProvider>
    );
  };

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

  it('meets accessibility requirements', () => {
    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        recoverError={mockRecoverError}
      />
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    
    const title = screen.getByRole('heading');
    expect(title.id).toBe(dialog.getAttribute('aria-labelledby'));
    
    const message = screen.getByText(mockError.message);
    expect(message.parentElement?.id).toBe(dialog.getAttribute('aria-describedby'));
  });

  it('handles keyboard navigation', () => {
    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        recoverError={mockRecoverError}
      />
    );

    const dialog = screen.getByRole('alertdialog');
    
    // Test Escape key
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(mockResetError).toHaveBeenCalled();

    // Test tab navigation
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);
    
    fireEvent.keyDown(buttons[0], { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('shows loading state during recovery', () => {
    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        recoverError={mockRecoverError}
        isRecovering={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  it('displays cooldown message when recovery attempts exceeded', async () => {
    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        recoverError={mockRecoverError}
      />
    );

    // Simulate multiple recovery attempts
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await mockRecoverError();
      });
    }

    const cooldownMessage = screen.getByText(/Please wait/);
    expect(cooldownMessage).toHaveAttribute('aria-live', 'polite');
  });

  it('shows stack trace only in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
      />
    );

    const stackTrace = screen.getByLabelText('Error stack trace');
    expect(stackTrace).toBeInTheDocument();
    expect(stackTrace).toHaveAttribute('tabIndex', '0');

    process.env.NODE_ENV = originalEnv;
  });

  it('provides accessible button labels', () => {
    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        recoverError={mockRecoverError}
        isRecovering={true}
      />
    );

    const recoverButton = screen.getByText('Try to Resume');
    expect(recoverButton).toHaveTextContent(/Loading/);
    expect(screen.getByText(/Loading/)).toHaveClass('visually-hidden');
  });

  it('maintains focus within dialog', () => {
    renderWithProvider(
      <ErrorFallback
        error={mockError}
        resetError={mockResetError}
        recoverError={mockRecoverError}
      />
    );

    const dialog = screen.getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);
  });
});