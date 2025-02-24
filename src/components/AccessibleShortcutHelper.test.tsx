import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AccessibleShortcutHelper } from './AccessibleShortcutHelper';
import userEvent from '@testing-library/user-event';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { KeyboardShortcut } from '../types';

jest.mock('../hooks/useErrorManagement');

describe('AccessibleShortcutHelper', () => {
  const mockOnClose = jest.fn();
  
  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      description: 'Option 1',
      action: jest.fn(),
      allowInErrorState: false
    },
    {
      key: 'Esc',
      description: 'Close dialog',
      action: jest.fn(),
      allowInErrorState: true
    }
  ];

  beforeEach(() => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      activeErrorCount: 0,
      isHandlingError: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all shortcuts when no errors', () => {
    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={true}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Close dialog')).toBeInTheDocument();
  });

  it('filters non-error-safe shortcuts during errors', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      activeErrorCount: 1,
      isHandlingError: false
    });

    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={true}
      />
    );

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    expect(screen.getByText('Close dialog')).toBeInTheDocument();
  });

  it('shows stage-specific title when stage is provided', () => {
    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        stage="pre-seed"
        visible={true}
      />
    );

    expect(screen.getByText('Keyboard Shortcuts for pre-seed')).toBeInTheDocument();
  });

  it('handles escape key press', () => {
    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('sets initial focus on dialog', () => {
    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={true}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(dialog);
  });

  it('displays error state badge for eligible shortcuts', () => {
    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={true}
      />
    );

    expect(screen.getByText('Error Safe')).toBeInTheDocument();
  });

  it('shows error note when errors are active', () => {
    (useErrorManagement as jest.Mock).mockReturnValue({
      activeErrorCount: 1,
      isHandlingError: false
    });

    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={true}
      />
    );

    expect(screen.getByText(/Some shortcuts are disabled during errors/)).toBeInTheDocument();
  });

  it('renders nothing when not visible', () => {
    render(
      <AccessibleShortcutHelper
        shortcuts={mockShortcuts}
        visible={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  const mockShortcutsOld = [
    { key: 'ctrl+s', description: 'Save progress', action: jest.fn() },
    { key: '→', description: 'Next question', action: jest.fn() },
    { key: '←', description: 'Previous question', action: jest.fn() }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows and hides with ? key', () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcutsOld} />);
    
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
    render(<AccessibleShortcutHelper shortcuts={mockShortcutsOld} />);

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/keyboard shortcuts panel opened/i);
  });

  it('supports keyboard navigation', async () => {
    render(<AccessibleShortcutHelper shortcuts={mockShortcutsOld} />);

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
    expect(mockShortcutsOld[0].action).toHaveBeenCalled();
  });

  it('closes with Escape key', () => {
    const onClose = jest.fn();
    render(
      <AccessibleShortcutHelper 
        shortcuts={mockShortcutsOld}
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
        shortcuts={mockShortcutsOld}
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
    render(<AccessibleShortcutHelper shortcuts={mockShortcutsOld} />);

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
    render(<AccessibleShortcutHelper shortcuts={mockShortcutsOld} />);

    act(() => {
      fireEvent.keyDown(window, { key: '?' });
    });

    expect(screen.getByLabelText(/close keyboard shortcuts/i)).toBeInTheDocument();
  });
});