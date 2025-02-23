import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import KeyboardShortcutHelper from './KeyboardShortcutHelper';
import { KeyboardShortcut } from '../types';

describe('KeyboardShortcutHelper', () => {
  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      description: 'Next question',
      action: jest.fn()
    },
    {
      key: 'p',
      description: 'Previous question',
      action: jest.fn()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows and hides when ? key is pressed', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);
    
    // Initially hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Show with ? key
    fireEvent.keyDown(document, { key: '?' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Hide with ? key
    fireEvent.keyDown(document, { key: '?' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides when escape is pressed', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);
    
    // Show dialog
    fireEvent.keyDown(document, { key: '?' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Hide with escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('executes shortcut actions when keys are pressed', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);

    // Press 'n' key
    fireEvent.keyDown(document, { key: 'n' });
    expect(mockShortcuts[0].action).toHaveBeenCalled();

    // Press 'p' key
    fireEvent.keyDown(document, { key: 'p' });
    expect(mockShortcuts[1].action).toHaveBeenCalled();
  });

  it('ignores shortcuts when disabled', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} isEnabled={false} />);

    fireEvent.keyDown(document, { key: 'n' });
    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
  });

  it('provides accessible labels for shortcuts', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);
    
    // Show dialog
    fireEvent.keyDown(document, { key: '?' });

    mockShortcuts.forEach(shortcut => {
      const description = screen.getByText(shortcut.description);
      expect(description).toHaveAttribute(
        'aria-label',
        `Press ${shortcut.key} to ${shortcut.description}`
      );
    });
  });

  it('handles close button interaction', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);
    
    // Show dialog
    fireEvent.keyDown(document, { key: '?' });

    const closeButton = screen.getByLabelText('Close keyboard shortcuts');
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('maintains focus trap within dialog', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);
    
    // Show dialog
    fireEvent.keyDown(document, { key: '?' });

    const dialog = screen.getByRole('dialog');
    const closeButton = screen.getByLabelText('Close keyboard shortcuts');

    // Initial focus should be on dialog
    expect(document.activeElement).toBe(dialog);

    // Tab to close button
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);
  });

  it('highlights active shortcut', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);
    
    // Show dialog
    fireEvent.keyDown(document, { key: '?' });

    // Press 'n' key
    fireEvent.keyDown(document, { key: 'n' });

    const shortcutItem = screen.getByText('Next question').parentElement;
    expect(shortcutItem).toHaveClass('is-active');
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <KeyboardShortcutHelper shortcuts={mockShortcuts} />
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});