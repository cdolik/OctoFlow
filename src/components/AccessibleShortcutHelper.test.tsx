import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AccessibleShortcutHelper } from './AccessibleShortcutHelper';
import userEvent from '@testing-library/user-event';

describe('AccessibleShortcutHelper', () => {
  const mockShortcuts = [
    { key: 'ctrl+s', description: 'Save progress', action: jest.fn() },
    { key: '→', description: 'Next question', action: jest.fn() },
    { key: '←', description: 'Previous question', action: jest.fn() }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows and hides with ? key', () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcuts} />);
    
    // Initially hidden
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Show with ? key
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Hide with ? key
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('announces to screen readers when opened', () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcuts} />);

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/keyboard shortcuts panel opened/i);
  });

  it('supports keyboard navigation', async () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcuts} />);

    // Open panel
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    const items = screen.getAllByRole('listitem');
    
    // Navigate down
    act(() => {
      fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    });
    expect(items[1]).toHaveClass('focused');

    // Navigate up
    act(() => {
      fireEvent.keyDown(items[1], { key: 'ArrowUp' });
    });
    expect(items[0]).toHaveClass('focused');

    // Activate shortcut with Enter
    act(() => {
      fireEvent.keyDown(items[0], { key: 'Enter' });
    });
    expect(mockShortcuts[0].action).toHaveBeenCalled();
  });

  it('closes with Escape key', () => {
    const onClose = jest.fn();
    render(
      <AccessibleShortcutHelper 
        shortcuts={mockShortcuts}
        onClose={onClose}
      />
    );

    // Open panel
    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    // Close with Escape
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows advanced shortcuts when enabled', () => {
    render(
      <AccessibleShortcutHelper 
        shortcuts={mockShortcuts}
        showAdvanced={true}
      />
    );

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    expect(screen.getByText(/advanced shortcuts/i)).toBeInTheDocument();
    expect(screen.getByText(/ctrl \+ \//i)).toBeInTheDocument();
  });

  it('maintains focus management', async () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcuts} />);

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    const items = screen.getAllByRole('listitem');
    
    // Tab through items
    await userEvent.tab();
    expect(items[0]).toHaveFocus();

    await userEvent.tab();
    expect(items[1]).toHaveFocus();

    await userEvent.tab();
    expect(items[2]).toHaveFocus();
  });

  it('provides accessible button labels', () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcuts} />);

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    expect(screen.getByLabelText(/close keyboard shortcuts/i)).toBeInTheDocument();
  });
});