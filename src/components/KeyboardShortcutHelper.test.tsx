import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KeyboardShortcutHelper } from './KeyboardShortcutHelper';
import { useAudioFeedback } from './AudioFeedback';
import { ValidationError } from '../types/errors';
import { useErrorManagement } from '../hooks/useErrorManagement';

jest.mock('./AudioFeedback');
jest.mock('../hooks/useErrorManagement');

describe('KeyboardShortcutHelper', () => {
  const mockPlaySound = jest.fn();
  const mockHandleError = jest.fn();
  const mockOnError = jest.fn();
  const mockShortcuts = [
    {
      key: 'n',
      description: 'Next question',
      category: 'Navigation'
    },
    {
      key: 'p',
      description: 'Previous question',
      category: 'Navigation'
    },
    {
      key: '1',
      description: 'Score: Low',
      category: 'Scoring',
      warning: 'Cannot be undone'
    }
  ];

  beforeEach(() => {
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
    (useErrorManagement as jest.Mock).mockReturnValue({
      handleError: mockHandleError
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows and hides on ? key press', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
      />
    );

    // Initially hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Show with ? key
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('info');

    // Hide with ? key
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
  });

  it('groups shortcuts by category', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
      />
    );

    // Show helper
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Scoring')).toBeInTheDocument();
  });

  it('expands and collapses categories', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    const navigationButton = screen.getByText('Navigation');
    
    // Expand category
    fireEvent.click(navigationButton);
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
    expect(screen.getByText('Next question')).toBeInTheDocument();
    expect(screen.getByText('Previous question')).toBeInTheDocument();

    // Collapse category
    fireEvent.click(navigationButton);
    expect(screen.queryByText('Next question')).not.toBeVisible();
  });

  it('closes on escape key', () => {
    const onClose = jest.fn();
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
        onClose={onClose}
      />
    );

    // Show helper
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    // Close with escape
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
  });

  it('displays stage-specific title when provided', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
        stage="pre-seed"
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    expect(screen.getByText('Keyboard Shortcuts for pre-seed')).toBeInTheDocument();
  });

  it('displays warning text for shortcuts with warnings', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    // Expand Scoring category
    fireEvent.click(screen.getByText('Scoring'));
    
    expect(screen.getByText('Cannot be undone')).toBeInTheDocument();
    expect(screen.getByText('Cannot be undone')).toHaveAttribute('role', 'alert');
  });

  it('maintains accessibility attributes for expandable sections', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={true}
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    const navigationButton = screen.getByText('Navigation').closest('button');
    expect(navigationButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(navigationButton!);
    expect(navigationButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('ignores keyboard shortcuts when disabled', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        isEnabled={false}
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockPlaySound).not.toHaveBeenCalled();
  });

  const newMockShortcuts = [
    {
      key: 'S',
      ctrl: true,
      action: jest.fn(),
      description: 'Save'
    },
    {
      key: 'Z',
      ctrl: true,
      shift: true,
      action: jest.fn(),
      description: 'Redo'
    }
  ];

  it('renders list of keyboard shortcuts', () => {
    render(<KeyboardShortcutHelper shortcuts={newMockShortcuts} />);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('handles keyboard events when enabled', () => {
    render(<KeyboardShortcutHelper shortcuts={newMockShortcuts} />);

    fireEvent.keyDown(document, {
      key: 'S',
      ctrlKey: true,
      preventDefault: jest.fn()
    });

    expect(newMockShortcuts[0].action).toHaveBeenCalled();
  });

  it('does not handle keyboard events when disabled', () => {
    render(<KeyboardShortcutHelper shortcuts={newMockShortcuts} disabled={true} />);

    fireEvent.keyDown(document, {
      key: 'S',
      ctrlKey: true,
      preventDefault: jest.fn()
    });

    expect(newMockShortcuts[0].action).not.toHaveBeenCalled();
  });

  it('validates shortcuts for duplicates', () => {
    const duplicateShortcuts = [
      {
        key: 'S',
        ctrl: true,
        action: jest.fn(),
        description: 'Save'
      },
      {
        key: 'S',
        ctrl: true,
        action: jest.fn(),
        description: 'Another Save'
      }
    ];

    expect(() => {
      render(<KeyboardShortcutHelper shortcuts={duplicateShortcuts} />);
    }).toThrow(ValidationError);
  });

  it('handles errors in shortcut actions', () => {
    const errorShortcuts = [
      {
        key: 'E',
        action: () => {
          throw new Error('Action failed');
        },
        description: 'Error action'
      }
    ];

    render(
      <KeyboardShortcutHelper
        shortcuts={errorShortcuts}
        onError={mockOnError}
      />
    );

    fireEvent.keyDown(document, { key: 'E' });

    expect(mockHandleError).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalled();
  });

  it('properly formats shortcut display', () => {
    render(<KeyboardShortcutHelper shortcuts={newMockShortcuts} />);

    const shortcutElements = screen.getAllByRole('listitem');
    expect(shortcutElements[0]).toHaveTextContent('Ctrl + S');
    expect(shortcutElements[1]).toHaveTextContent('Ctrl + Shift + Z');
  });

  it('handles alt key combinations', () => {
    const altShortcuts = [
      {
        key: 'A',
        alt: true,
        action: jest.fn(),
        description: 'Alt action'
      }
    ];

    render(<KeyboardShortcutHelper shortcuts={altShortcuts} />);

    fireEvent.keyDown(document, {
      key: 'A',
      altKey: true,
      preventDefault: jest.fn()
    });

    expect(altShortcuts[0].action).toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <KeyboardShortcutHelper shortcuts={newMockShortcuts} />
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('prevents default browser shortcuts when handling events', () => {
    const preventDefault = jest.fn();
    render(<KeyboardShortcutHelper shortcuts={newMockShortcuts} />);

    fireEvent.keyDown(document, {
      key: 'S',
      ctrlKey: true,
      preventDefault
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('applies correct styling to keyboard shortcut display', () => {
    render(<KeyboardShortcutHelper shortcuts={newMockShortcuts} />);

    const kbdElements = screen.getAllByRole('listitem')
      .map(item => item.querySelector('kbd'));

    kbdElements.forEach(kbd => {
      expect(kbd).toHaveClass('shortcut-key');
    });
  });

  it('handles case-insensitive key matching', () => {
    const action = jest.fn();
    const shortcuts = [
      {
        key: 'S',
        action,
        description: 'Save'
      }
    ];

    render(<KeyboardShortcutHelper shortcuts={shortcuts} />);

    // Test lowercase
    fireEvent.keyDown(document, { key: 's' });
    expect(action).toHaveBeenCalled();

    // Test uppercase
    action.mockClear();
    fireEvent.keyDown(document, { key: 'S' });
    expect(action).toHaveBeenCalled();
  });
});