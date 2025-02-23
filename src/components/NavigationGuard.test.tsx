import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { NavigationGuard } from './NavigationGuard';
import { ErrorProvider } from '../contexts/ErrorContext';
import { useStorage } from '../hooks/useStorage';
import { validateStorageState } from '../utils/storageValidation';

jest.mock('../hooks/useStorage');
jest.mock('../utils/storageValidation');

describe('NavigationGuard', () => {
  const mockOnBlocked = jest.fn();
  const mockState = {
    stage: 'pre-seed',
    responses: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({ state: mockState });
    (validateStorageState as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
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
});