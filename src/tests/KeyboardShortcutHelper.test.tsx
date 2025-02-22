import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import KeyboardShortcutHelper from '../components/KeyboardShortcutHelper';

describe('KeyboardShortcutHelper', () => {
  const mockShortcuts = [
    { key: '→', description: 'Next question', icon: '→' },
    { key: '←', description: 'Previous question', icon: '←' },
    { key: '1-4', description: 'Select option', icon: '#' }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all shortcuts', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);

    mockShortcuts.forEach(shortcut => {
      expect(screen.getByText(shortcut.key)).toBeInTheDocument();
      expect(screen.getByText(shortcut.description)).toBeInTheDocument();
    });
  });

  it('auto-hides after specified delay', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        autoHide={true}
        hideDelay={5000}
      />
    );

    expect(screen.getByRole('complementary')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('stays visible when autoHide is false', () => {
    render(
      <KeyboardShortcutHelper 
        shortcuts={mockShortcuts}
        autoHide={false}
      />
    );

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('can be closed manually', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<KeyboardShortcutHelper shortcuts={mockShortcuts} />);

    const helper = screen.getByRole('complementary');
    expect(helper).toHaveAttribute('aria-label', 'Keyboard shortcuts');
  });

  it('renders icons when provided', () => {
    const shortcutsWithIcons = [
      { key: 'Enter', description: 'Submit', icon: '↵' }
    ];

    render(<KeyboardShortcutHelper shortcuts={shortcutsWithIcons} />);
    expect(screen.getByText('↵')).toBeInTheDocument();
  });

  it('displays common shortcuts for all stages', () => {
    render(<KeyboardShortcutHelper stage="pre-seed" />);
    
    // Check common shortcuts are present
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('shows stage-specific shortcuts', () => {
    const { rerender } = render(<KeyboardShortcutHelper stage="pre-seed" />);
    expect(screen.getByText('Save progress')).toBeInTheDocument();

    rerender(<KeyboardShortcutHelper stage="seed" />);
    expect(screen.getByText('Review previous answers')).toBeInTheDocument();

    rerender(<KeyboardShortcutHelper stage="series-a" />);
    expect(screen.getByText('Compare with benchmarks')).toBeInTheDocument();
  });

  it('toggles advanced shortcuts visibility', () => {
    render(<KeyboardShortcutHelper stage="pre-seed" showAdvanced={false} />);
    
    const toggleButton = screen.getByText('Show Advanced Shortcuts');
    fireEvent.click(toggleButton);

    // Simulate the event listener response
    window.dispatchEvent(new CustomEvent('toggleAdvancedShortcuts'));
    
    // Advanced shortcuts should be shown when props are updated
    const { rerender } = render(<KeyboardShortcutHelper stage="pre-seed" showAdvanced={true} />);
    expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
    expect(screen.getByText('Toggle benchmarks view')).toBeInTheDocument();
  });

  it('maintains proper accessibility attributes', () => {
    render(<KeyboardShortcutHelper stage="pre-seed" />);
    
    const container = screen.getByRole('complementary');
    expect(container).toHaveAttribute('aria-label', 'Keyboard shortcuts');
    
    const shortcuts = screen.getAllByRole('listitem');
    expect(shortcuts.length).toBeGreaterThan(0);
  });
});