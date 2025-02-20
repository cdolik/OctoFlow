import React from 'react';
import { render, screen, act } from '@testing-library/react';
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
});