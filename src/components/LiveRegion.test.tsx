import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LiveRegion, { announce } from './LiveRegion';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { axe } from 'jest-axe';
import { testAccessibility } from '../tests/a11y-test-utils';

jest.mock('../contexts/KeyboardShortcutsContext');
jest.useFakeTimers();

describe('LiveRegion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({ activeShortcut: null });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    render(<LiveRegion />);

    const politeRegion = screen.getByRole('status').parentElement;
    const assertiveRegion = screen.getAllByRole('generic')[1];

    expect(politeRegion).toHaveAttribute('aria-live', 'polite');
    expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
    expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
  });

  it('announces keyboard shortcuts', () => {
    (useKeyboardShortcuts as jest.Mock).mockReturnValue({
      activeShortcut: {
        key: 'n',
        description: 'Next question',
        action: jest.fn()
      }
    });

    render(<LiveRegion />);
    expect(screen.getByText('Next question shortcut activated')).toBeInTheDocument();
  });

  it('handles custom announcements', () => {
    render(<LiveRegion />);

    act(() => {
      announce('Test message', 'status');
    });

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('clears messages after specified time', () => {
    render(<LiveRegion clearAfter={1000} />);

    act(() => {
      announce('Temporary message', 'status');
    });

    expect(screen.getByText('Temporary message')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Temporary message')).not.toBeInTheDocument();
  });

  it('handles alert messages separately', () => {
    render(<LiveRegion />);

    act(() => {
      announce('Error occurred', 'alert');
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error occurred');
  });

  it('applies message filter', () => {
    const filter = (message: { type: string }) => message.type === 'status';
    render(<LiveRegion filter={filter} />);

    act(() => {
      announce('Status message', 'status');
      announce('Alert message', 'alert');
    });

    expect(screen.getByText('Status message')).toBeInTheDocument();
    expect(screen.queryByText('Alert message')).not.toBeInTheDocument();
  });

  it('handles multiple messages', () => {
    render(<LiveRegion />);

    act(() => {
      announce('First message', 'status');
      announce('Second message', 'info');
      announce('Error message', 'alert');
    });

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('cleans up timeouts on unmount', () => {
    const { unmount } = render(<LiveRegion clearAfter={1000} />);

    act(() => {
      announce('Test message', 'status');
    });

    unmount();

    // Ensure no errors when timer tries to fire after unmount
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });

  it('respects politeness prop', () => {
    render(<LiveRegion politeness="assertive" />);

    const region = screen.getByRole('status').parentElement;
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('maintains message order', () => {
    render(<LiveRegion />);

    act(() => {
      announce('First');
      announce('Second');
      announce('Third');
    });

    const messages = screen.getAllByRole('status');
    expect(messages[0]).toHaveTextContent('First');
    expect(messages[1]).toHaveTextContent('Second');
    expect(messages[2]).toHaveTextContent('Third');
  });
});