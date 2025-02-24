import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Router, useNavigate, useLocation } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { NavigationGuard } from './NavigationGuard';
import { ErrorProvider } from '../contexts/ErrorContext';
import { useStorage } from '../hooks/useStorage';
import { validateStorageState } from '../utils/storageValidation';
import { useError } from '../contexts/ErrorContext';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

jest.mock('../hooks/useStorage');
jest.mock('../utils/storageValidation');
jest.mock('../contexts/ErrorContext');
jest.mock('./AudioFeedback');

describe('NavigationGuard', () => {
  const mockOnBlocked = jest.fn();
  const mockState = {
    stage: 'pre-seed',
    responses: {}
  };
  const mockNavigate = jest.fn();
  const mockHandleError = jest.fn();
  const mockPlaySound = jest.fn();
  const mockSaveState = jest.fn();
  const mockLocation = { pathname: '/current' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/test' });
    (useError as jest.Mock).mockReturnValue({ handleError: mockHandleError });
    (useStorage as jest.Mock).mockReturnValue({
      isSessionActive: true,
      timeUntilExpiration: 600000 // 10 minutes
    });
    (useStorage as jest.Mock).mockReturnValue({ state: mockState });
    (validateStorageState as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
    (useStorage as jest.Mock).mockReturnValue({
      saveState: mockSaveState,
      state: mockState
    });

    // Mock window beforeunload event
    const events: Record<string, (e: BeforeUnloadEvent) => void> = {};
    window.addEventListener = jest.fn((event, cb) => {
      events[event] = cb;
    });
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows navigation when no errors present', () => {
    const history = createMemoryHistory();
    
    render(
      <Router location={history.location} navigator={history}>
        <ErrorProvider>
          <NavigationGuard onBlockedNavigation={mockOnBlocked}>
            <div>Protected Content</div>
          </NavigationGuard>
        </ErrorProvider>
      </Router>
    );

    act(() => {
      history.push('/assessment');
    });

    expect(history.location.pathname).toBe('/assessment');
    expect(mockOnBlocked).not.toHaveBeenCalled();
  });

  it('blocks navigation during error state', () => {
    const history = createMemoryHistory();
    const invalidState = { ...mockState, invalid: true };
    (useStorage as jest.Mock).mockReturnValue({ state: invalidState });
    (validateStorageState as jest.Mock).mockReturnValue({ isValid: false, errors: ['Invalid state'] });

    render(
      <Router location={history.location} navigator={history}>
        <ErrorProvider maxAttempts={1}>
          <NavigationGuard onBlockedNavigation={mockOnBlocked}>
            <div>Protected Content</div>
          </NavigationGuard>
        </ErrorProvider>
      </Router>
    );

    const popStateEvent = new PopStateEvent('popstate');
    act(() => {
      window.dispatchEvent(popStateEvent);
    });

    expect(mockOnBlocked).toHaveBeenCalled();
  });

  it('redirects to home when accessing protected route in error state', () => {
    const history = createMemoryHistory();
    history.push('/assessment');

    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      error: new Error('Storage error')
    });

    render(
      <Router location={history.location} navigator={history}>
        <ErrorProvider maxAttempts={1}>
          <NavigationGuard onBlockedNavigation={mockOnBlocked}>
            <div>Protected Content</div>
          </NavigationGuard>
        </ErrorProvider>
      </Router>
    );

    act(() => {
      // Simulate max attempts reached
      const errorEvent = new Error('Test error');
      window.dispatchEvent(new CustomEvent('error', { detail: errorEvent }));
    });

    expect(history.location.pathname).toBe('/');
  });

  it('handles beforeunload event with invalid state', () => {
    (validateStorageState as jest.Mock).mockReturnValue({ isValid: false, errors: ['Invalid state'] });

    render(
      <MemoryRouter>
        <ErrorProvider>
          <NavigationGuard onBlockedNavigation={mockOnBlocked}>
            <div>Protected Content</div>
          </NavigationGuard>
        </ErrorProvider>
      </MemoryRouter>
    );

    const beforeUnloadEvent = new Event('beforeunload') as BeforeUnloadEvent;
    Object.defineProperty(beforeUnloadEvent, 'preventDefault', { value: jest.fn() });
    Object.defineProperty(beforeUnloadEvent, 'returnValue', { value: '', writable: true });

    act(() => {
      window.dispatchEvent(beforeUnloadEvent);
    });

    expect(beforeUnloadEvent.preventDefault).toHaveBeenCalled();
    expect(beforeUnloadEvent.returnValue).toBe('');
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <MemoryRouter>
        <ErrorProvider>
          <NavigationGuard onBlockedNavigation={mockOnBlocked}>
            <div>Protected Content</div>
          </NavigationGuard>
        </ErrorProvider>
      </MemoryRouter>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('renders children when session is active', () => {
    render(
      <MemoryRouter>
        <NavigationGuard>
          <div>Test Content</div>
        </NavigationGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('redirects to session expired page when session is inactive', () => {
    (useStorage as jest.Mock).mockReturnValue({
      isSessionActive: false,
      timeUntilExpiration: 0
    });

    render(
      <MemoryRouter>
        <NavigationGuard>
          <div>Test Content</div>
        </NavigationGuard>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/session-expired', {
      state: { from: '/test' }
    });
    expect(mockHandleError).toHaveBeenCalled();
  });

  it('shows session expiration warning when close to timeout', () => {
    (useStorage as jest.Mock).mockReturnValue({
      isSessionActive: true,
      timeUntilExpiration: 240000 // 4 minutes
    });

    render(
      <MemoryRouter>
        <NavigationGuard>
          <div>Test Content</div>
        </NavigationGuard>
      </MemoryRouter>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Session will expire in 4 minutes');
  });

  it('handles beforeunload event when there are unsaved changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <NavigationGuard>
          <div>Test Content</div>
        </NavigationGuard>
      </MemoryRouter>
    );

    // Simulate unsaved changes
    const events: Record<string, (e: BeforeUnloadEvent) => void> = {};
    window.addEventListener = jest.fn((event, cb) => {
      events[event] = cb;
    });

    rerender(
      <MemoryRouter>
        <NavigationGuard hasUnsavedChanges={true}>
          <div>Test Content</div>
        </NavigationGuard>
      </MemoryRouter>
    );

    const mockEvent = {
      preventDefault: jest.fn(),
      returnValue: ''
    };

    // Trigger beforeunload event
    if (events.beforeunload) {
      events.beforeunload(mockEvent as any);
    }

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('');
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    );
  };

  it('renders children without prompt when not blocked', () => {
    renderWithRouter(
      <NavigationGuard when={false}>
        <div>Protected Content</div>
      </NavigationGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows prompt when navigation is attempted and blocked', () => {
    renderWithRouter(
      <NavigationGuard when={true}>
        <div>Protected Content</div>
      </NavigationGuard>
    );

    // Simulate navigation attempt
    const unblock = mockNavigate.mock.calls[0][0];
    act(() => {
      unblock('/next-page');
    });

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('warning');
  });

  it('handles confirmation with auto-save', async () => {
    renderWithRouter(
      <NavigationGuard when={true}>
        <div>Protected Content</div>
      </NavigationGuard>
    );

    // Trigger navigation
    const unblock = mockNavigate.mock.calls[0][0];
    act(() => {
      unblock('/next-page');
    });

    // Confirm navigation
    const confirmButton = screen.getByText('Leave');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(mockSaveState).toHaveBeenCalledWith({
      ...mockState,
      metadata: {
        ...mockState.metadata,
        lastLocation: '/current'
      }
    });
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
    expect(mockNavigate).toHaveBeenCalledWith('/next-page');
  });

  it('handles cancellation', () => {
    renderWithRouter(
      <NavigationGuard when={true}>
        <div>Protected Content</div>
      </NavigationGuard>
    );

    // Trigger navigation
    const unblock = mockNavigate.mock.calls[0][0];
    act(() => {
      unblock('/next-page');
    });

    // Cancel navigation
    const cancelButton = screen.getByText('Stay');
    fireEvent.click(cancelButton);

    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('calls onBeforeNavigate hook before confirming navigation', async () => {
    const onBeforeNavigate = jest.fn().mockResolvedValue(false);
    
    renderWithRouter(
      <NavigationGuard
        when={true}
        onBeforeNavigate={onBeforeNavigate}
      >
        <div>Protected Content</div>
      </NavigationGuard>
    );

    // Trigger navigation
    const unblock = mockNavigate.mock.calls[0][0];
    act(() => {
      unblock('/next-page');
    });

    // Attempt to confirm
    const confirmButton = screen.getByText('Leave');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(onBeforeNavigate).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles beforeunload event', () => {
    const { container } = renderWithRouter(
      <NavigationGuard when={true}>
        <div>Protected Content</div>
      </NavigationGuard>
    );

    const event = new Event('beforeunload') as BeforeUnloadEvent;
    event.preventDefault = jest.fn();

    // Simulate beforeunload event
    act(() => {
      window.dispatchEvent(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('announces navigation warning via LiveRegion', () => {
    const customMessage = 'Custom warning message';
    renderWithRouter(
      <NavigationGuard
        when={true}
        message={customMessage}
      >
        <div>Protected Content</div>
      </NavigationGuard>
    );

    // Trigger navigation
    const unblock = mockNavigate.mock.calls[0][0];
    act(() => {
      unblock('/next-page');
    });

    expect(screen.getByText(`Navigation warning: ${customMessage}`))
      .toBeInTheDocument();
  });

  it('maintains focus management for accessibility', () => {
    renderWithRouter(
      <NavigationGuard when={true}>
        <div>Protected Content</div>
      </NavigationGuard>
    );

    // Trigger navigation
    const unblock = mockNavigate.mock.calls[0][0];
    act(() => {
      unblock('/next-page');
    });

    const confirmButton = screen.getByText('Leave');
    expect(document.activeElement).toBe(confirmButton);
  });
});