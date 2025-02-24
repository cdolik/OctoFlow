import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ErrorProvider } from '../contexts/ErrorContext';
import ErrorFallback from './ErrorFallback';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAudioFeedback } from './AudioFeedback';
import { AssessmentError } from '../types/errors';

jest.mock('../hooks/useErrorManagement');
jest.mock('../hooks/useKeyboardNavigation');
jest.mock('./AudioFeedback');

describe('ErrorFallback', () => {
  const mockError = new Error('Test error');
  const mockReset = jest.fn();
  const mockResetError = jest.fn();
  const mockRecoverError = jest.fn();
  const mockPlaySound = jest.fn();

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
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
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

  it('plays error sound on mount', () => {
    render(
      <ErrorFallback 
        error={new Error('Test error')}
      />
    );

    expect(mockPlaySound).toHaveBeenCalledWith('error');
  });

  it('displays appropriate error message based on error code', () => {
    const storageError = new Error('Storage failed') as AssessmentError;
    storageError.code = 'STORAGE_ERROR';

    const { rerender } = render(
      <ErrorFallback error={storageError} />
    );
    expect(screen.getByText(/Unable to save your progress/)).toBeInTheDocument();

    const networkError = new Error('Network failed') as AssessmentError;
    networkError.code = 'NETWORK_ERROR';
    rerender(<ErrorFallback error={networkError} />);
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
  });

  it('handles critical errors differently', () => {
    const criticalError = new Error('Critical failure') as AssessmentError;
    criticalError.severity = 'critical';

    render(<ErrorFallback error={criticalError} />);
    expect(screen.getByText('Critical Error')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('critical');
  });

  it('shows technical details when showDetails is true', () => {
    const error = new Error('Test error');
    const errorInfo = {
      componentStack: '\n    at Component\n    at App'
    };

    render(
      <ErrorFallback 
        error={error}
        errorInfo={errorInfo}
        showDetails={true}
      />
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();
    const details = screen.getByText(errorInfo.componentStack);
    expect(details).toBeInTheDocument();
  });

  it('handles error recovery when error is recoverable', () => {
    const resetError = jest.fn();
    const recoverableError = new Error('Recoverable error') as AssessmentError;
    recoverableError.recoverable = true;

    render(
      <ErrorFallback 
        error={recoverableError}
        resetError={resetError}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Try again/i });
    fireEvent.click(retryButton);

    expect(resetError).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('info');
  });

  it('does not show retry button for non-recoverable errors', () => {
    const nonRecoverableError = new Error('Non-recoverable error') as AssessmentError;
    nonRecoverableError.recoverable = false;

    render(
      <ErrorFallback 
        error={nonRecoverableError}
        resetError={jest.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument();
  });

  it('provides appropriate action text based on error code', () => {
    const validationError = new Error('Invalid input') as AssessmentError;
    validationError.code = 'VALIDATION_ERROR';

    render(
      <ErrorFallback 
        error={validationError}
        resetError={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Review and correct your input/i })).toBeInTheDocument();
  });

  it('maintains proper ARIA attributes for accessibility', () => {
    render(
      <ErrorFallback 
        error={new Error('Test error')}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('handles refresh page action', () => {
    const locationReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: locationReload },
      writable: true
    });

    render(
      <ErrorFallback 
        error={new Error('Test error')}
      />
    );

    fireEvent.click(screen.getByText('Refresh Page'));
    expect(locationReload).toHaveBeenCalled();
  });

  it('announces errors to screen readers via LiveRegion', () => {
    const error = new Error('Accessibility test error') as AssessmentError;
    error.severity = 'critical';

    render(
      <ErrorFallback 
        error={error}
      />
    );

    expect(screen.getByText('Critical error: Accessibility test error')).toBeInTheDocument();
  });
});