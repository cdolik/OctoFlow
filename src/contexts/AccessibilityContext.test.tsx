import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from './AccessibilityContext';
import { useUserPreferences } from '../components/UserPreferences';

jest.mock('../components/UserPreferences');

describe('AccessibilityProvider', () => {
  const mockPreferences = {
    keyboardMode: 'basic'
  };

  beforeEach(() => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  const TestComponent = () => {
    const { announce, setFocusTarget, clearFocusTarget, lastAnnouncement } = useAccessibility();
    
    return (
      <div>
        <button 
          onClick={() => announce('Test announcement')}
          data-testid="announce-button"
        >
          Announce
        </button>
        <button 
          id="focus-target"
          onClick={() => setFocusTarget('focus-target')}
          data-testid="focus-button"
        >
          Focus
        </button>
        <button 
          onClick={clearFocusTarget}
          data-testid="clear-button"
        >
          Clear Focus
        </button>
        <div data-testid="last-announcement">{lastAnnouncement}</div>
      </div>
    );
  };

  it('creates announcer elements on demand', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    screen.getByTestId('announce-button').click();
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const politeAnnouncer = document.getElementById('accessibility-announcer-polite');
    expect(politeAnnouncer).toBeInTheDocument();
    expect(politeAnnouncer).toHaveAttribute('aria-live', 'polite');
  });

  it('manages focus targets correctly', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const focusButton = screen.getByTestId('focus-button');
    focusButton.click();
    expect(document.activeElement).toBe(focusButton);
  });

  it('clears focus styling', () => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: { keyboardMode: 'vim' }
    });

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const focusButton = screen.getByTestId('focus-button');
    focusButton.click();
    expect(focusButton.style.outline).toBe('2px solid var(--focus-ring-color)');

    screen.getByTestId('clear-button').click();
    expect(focusButton.style.outline).toBe('');
  });

  it('updates last announcement', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    screen.getByTestId('announce-button').click();
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByTestId('last-announcement')).toHaveTextContent('Test announcement');
  });

  it('handles assertive announcements', () => {
    const AssertiveTest = () => {
      const { announce } = useAccessibility();
      return (
        <button onClick={() => announce('Important!', 'assertive')}>
          Announce
        </button>
      );
    };

    render(
      <AccessibilityProvider>
        <AssertiveTest />
      </AccessibilityProvider>
    );

    screen.getByText('Announce').click();
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    const assertiveAnnouncer = document.getElementById('accessibility-announcer-assertive');
    expect(assertiveAnnouncer).toHaveAttribute('aria-live', 'assertive');
    expect(assertiveAnnouncer).toHaveTextContent('Important!');
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility must be used within an AccessibilityProvider');

    consoleError.mockRestore();
  });

  it('respects keyboard mode for focus styling', () => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: { keyboardMode: 'basic' }
    });

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const focusButton = screen.getByTestId('focus-button');
    focusButton.click();
    expect(focusButton.style.outline).toBe('');
  });
});