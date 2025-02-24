import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KeyboardNavigationProvider, useKeyboardNavigation } from './KeyboardNavigationContext';
import { useUserPreferences } from '../components/UserPreferences';
import { useAudioFeedback } from '../components/AudioFeedback';

jest.mock('../components/UserPreferences');
jest.mock('../components/AudioFeedback');

describe('KeyboardNavigationProvider', () => {
  const mockPlaySound = jest.fn();
  const mockPreferences = {
    keyboardMode: 'basic'
  };

  beforeEach(() => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences
    });
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test component using the hook
  const TestComponent = () => {
    const { registerShortcut, shortcuts, currentMode } = useKeyboardNavigation();
    
    React.useEffect(() => {
      registerShortcut({
        key: 'j',
        description: 'Move down',
        action: jest.fn(),
        allowedModes: ['basic', 'vim']
      });
    }, [registerShortcut]);

    return (
      <div>
        <span data-testid="shortcuts-count">{shortcuts.length}</span>
        <span data-testid="current-mode">{currentMode}</span>
      </div>
    );
  };

  it('registers keyboard shortcuts', () => {
    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('1');
  });

  it('handles keyboard events for registered shortcuts', () => {
    const mockAction = jest.fn();
    const TestComponent = () => {
      const { registerShortcut } = useKeyboardNavigation();
      
      React.useEffect(() => {
        registerShortcut({
          key: 'j',
          description: 'Test action',
          action: mockAction
        });
      }, [registerShortcut]);

      return null;
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.keyDown(window, { key: 'j' });
    expect(mockAction).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
  });

  it('respects keyboard mode restrictions', () => {
    const mockAction = jest.fn();
    const TestComponent = () => {
      const { registerShortcut } = useKeyboardNavigation();
      
      React.useEffect(() => {
        registerShortcut({
          key: 'k',
          description: 'Vim only action',
          action: mockAction,
          allowedModes: ['vim']
        });
      }, [registerShortcut]);

      return null;
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.keyDown(window, { key: 'k' });
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('handles modifier key requirements', () => {
    const mockAction = jest.fn();
    const TestComponent = () => {
      const { registerShortcut } = useKeyboardNavigation();
      
      React.useEffect(() => {
        registerShortcut({
          key: 's',
          description: 'Save',
          action: mockAction,
          requiresModifier: true
        });
      }, [registerShortcut]);

      return null;
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    // Without modifier
    fireEvent.keyDown(window, { key: 's' });
    expect(mockAction).not.toHaveBeenCalled();

    // With modifier
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(mockAction).toHaveBeenCalled();
  });

  it('announces shortcuts via LiveRegion', () => {
    const mockAction = jest.fn();
    const TestComponent = () => {
      const { registerShortcut } = useKeyboardNavigation();
      
      React.useEffect(() => {
        registerShortcut({
          key: 'j',
          description: 'Move down',
          action: mockAction
        });
      }, [registerShortcut]);

      return null;
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.keyDown(window, { key: 'j' });
    expect(screen.getByText('Key pressed: j')).toBeInTheDocument();
  });

  it('disables keyboard navigation', () => {
    const mockAction = jest.fn();
    const TestComponent = () => {
      const { registerShortcut, setEnabled } = useKeyboardNavigation();
      
      React.useEffect(() => {
        registerShortcut({
          key: 'j',
          description: 'Test action',
          action: mockAction
        });
      }, [registerShortcut]);

      return (
        <button onClick={() => setEnabled(false)}>Disable</button>
      );
    };

    render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    fireEvent.click(screen.getByText('Disable'));
    fireEvent.keyDown(window, { key: 'j' });
    
    expect(mockAction).not.toHaveBeenCalled();
    expect(screen.getByText('Keyboard navigation is currently disabled')).toBeInTheDocument();
  });

  it('unregisters shortcuts correctly', () => {
    const TestComponent = () => {
      const { registerShortcut, unregisterShortcut, shortcuts } = useKeyboardNavigation();
      
      React.useEffect(() => {
        registerShortcut({
          key: 'j',
          description: 'Test action',
          action: jest.fn()
        });

        return () => unregisterShortcut('j');
      }, [registerShortcut, unregisterShortcut]);

      return (
        <span data-testid="shortcuts-count">{shortcuts.length}</span>
      );
    };

    const { unmount } = render(
      <KeyboardNavigationProvider>
        <TestComponent />
      </KeyboardNavigationProvider>
    );

    expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('1');
    
    unmount();
    
    render(
      <KeyboardNavigationProvider>
        <span data-testid="shortcuts-count">0</span>
      </KeyboardNavigationProvider>
    );
    
    expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('0');
  });

  it('throws error when hook is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useKeyboardNavigation must be used within a KeyboardNavigationProvider');

    consoleError.mockRestore();
  });
});