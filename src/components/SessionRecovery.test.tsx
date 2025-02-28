import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { SessionRecovery } from './SessionRecovery';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useOfflineError } from '../hooks/useOfflineError';
import { errorAnalytics } from '../utils/errorAnalytics';

jest.mock('../hooks/useErrorManagement');
jest.mock('../hooks/useOfflineError');
jest.mock('../utils/errorAnalytics');

describe('SessionRecovery', () => {
  const mockOnRecover = jest.fn();
  const mockHandleError = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');

    (useErrorManagement as jest.Mock).mockReturnValue({
      handleError: mockHandleError,
      clearError: mockClearError,
      error: null,
      isRecovering: false
    });

    (useOfflineError as jest.Mock).mockReturnValue({
      isOnline: true
    });
  });

  it('renders children when no session data exists', () => {
    render(
      <SessionRecovery>
        <div data-testid="test-content">Test Content</div>
      </SessionRecovery>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('attempts recovery when session data exists', async () => {
    const sessionData = {
      timestamp: new Date().toISOString(),
      stage: 'test-stage',
      data: { key: 'value' }
    };

    Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(sessionData));

    render(
      <SessionRecovery onRecover={mockOnRecover} stage="test-stage">
        <div>Test Content</div>
      </SessionRecovery>
    );

    await waitFor(() => {
      expect(mockOnRecover).toHaveBeenCalled();
    });
  });

  it('handles expired session data', () => {
    const oldTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    const sessionData = {
      timestamp: oldTimestamp,
      stage: 'test-stage',
      data: { key: 'value' }
    };

    Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(sessionData));

    render(
      <SessionRecovery onRecover={mockOnRecover}>
        <div>Test Content</div>
      </SessionRecovery>
    );

    expect(localStorage.removeItem).toHaveBeenCalled();
    expect(mockOnRecover).not.toHaveBeenCalled();
  });

  it('saves session state on beforeunload', () => {
    render(
      <SessionRecovery stage="test-stage">
        <div>Test Content</div>
      </SessionRecovery>
    );

    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(JSON.parse(localStorage.setItem.mock.calls[0][1])).toHaveProperty('timestamp');
  });

  it('saves session state on visibility change', () => {
    render(
      <SessionRecovery stage="test-stage">
        <div>Test Content</div>
      </SessionRecovery>
    );

    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('handles recovery errors gracefully', async () => {
    Storage.prototype.getItem = jest.fn().mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(
      <SessionRecovery onRecover={mockOnRecover}>
        <div>Test Content</div>
      </SessionRecovery>
    );

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
    expect(mockOnRecover).not.toHaveBeenCalled();
  });

  it('shows recovering state when attempting recovery', async () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      handleError: mockHandleError,
      clearError: mockClearError,
      error: null,
      isRecovering: true
    });

    render(
      <SessionRecovery>
        <div>Test Content</div>
      </SessionRecovery>
    );

    expect(screen.getByTestId('session-recovery')).toHaveClass('recovering');
  });

  it('tracks successful recovery in analytics', async () => {
    const sessionData = {
      timestamp: new Date().toISOString(),
      stage: 'test-stage',
      data: { key: 'value' }
    };

    Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(sessionData));

    render(
      <SessionRecovery onRecover={mockOnRecover} stage="test-stage">
        <div>Test Content</div>
      </SessionRecovery>
    );

    await waitFor(() => {
      expect(errorAnalytics.trackError).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          action: 'recoverSession',
          component: 'SessionRecovery'
        }),
        true
      );
    });
  });

  it('only attempts recovery when online', async () => {
    (useOfflineError as jest.Mock).mockReturnValue({
      isOnline: false
    });

    const sessionData = {
      timestamp: new Date().toISOString(),
      stage: 'test-stage',
      data: { key: 'value' }
    };

    Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(sessionData));

    render(
      <SessionRecovery onRecover={mockOnRecover}>
        <div>Test Content</div>
      </SessionRecovery>
    );

    expect(mockOnRecover).not.toHaveBeenCalled();

    act(() => {
      (useOfflineError as jest.Mock).mockReturnValue({
        isOnline: true
      });
    });

    await waitFor(() => {
      expect(mockOnRecover).toHaveBeenCalled();
    });
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <SessionRecovery>
        <div>Test Content</div>
      </SessionRecovery>
    );

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const documentRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});