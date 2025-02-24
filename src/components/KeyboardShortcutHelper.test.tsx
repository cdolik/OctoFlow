import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KeyboardShortcutHelper } from './KeyboardShortcutHelper';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('./AudioFeedback');

describe('KeyboardShortcutHelper', () => {
  const mockPlaySound = jest.fn();
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
});