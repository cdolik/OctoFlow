import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { KeyboardShortcutsProvider, useKeyboardShortcuts } from './KeyboardShortcutsContext';
import { KeyboardShortcut } from '../types';

describe('KeyboardShortcutsContext', () => {
  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      description: 'Next',
      action: jest.fn()
    }
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <KeyboardShortcutsProvider initialShortcuts={mockShortcuts}>
      {children}
    </KeyboardShortcutsProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides shortcuts context to children', () => {
    const TestComponent = () => {
      const { shortcuts } = useKeyboardShortcuts();
      return <div data-testid="shortcuts-length">{shortcuts.length}</div>;
    };

    render(<TestComponent />, { wrapper });
    expect(screen.getByTestId('shortcuts-length')).toHaveTextContent('1');
  });

  it('allows registering new shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

    act(() => {
      result.current.registerShortcut({
        key: 'p',
        description: 'Previous',
        action: jest.fn()
      });
    });

    expect(result.current.shortcuts).toHaveLength(2);
    expect(result.current.shortcuts[1].key).toBe('p');
  });

  it('prevents duplicate shortcut keys', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

    act(() => {
      result.current.registerShortcut({
        key: 'n', // Same key as existing shortcut
        description: 'New action',
        action: jest.fn()
      });
    });

    expect(result.current.shortcuts).toHaveLength(1);
    expect(result.current.shortcuts[0].description).toBe('Next');
  });

  it('enables and disables shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

    expect(result.current.isEnabled).toBe(true);

    act(() => {
      result.current.disableShortcuts();
    });

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.enableShortcuts();
    });

    expect(result.current.isEnabled).toBe(true);
  });

  it('toggles shortcuts state', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

    expect(result.current.isEnabled).toBe(true);

    act(() => {
      result.current.toggleShortcuts();
    });

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.toggleShortcuts();
    });

    expect(result.current.isEnabled).toBe(true);
  });

  it('handles initial enabled state', () => {
    const disabledWrapper = ({ children }: { children: React.ReactNode }) => (
      <KeyboardShortcutsProvider initialShortcuts={mockShortcuts} isEnabled={false}>
        {children}
      </KeyboardShortcutsProvider>
    );

    const { result } = renderHook(() => useKeyboardShortcuts(), { 
      wrapper: disabledWrapper 
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it('throws error when used outside provider', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.error).toEqual(
      Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider')
    );
  });

  it('maintains active shortcut state', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(), { wrapper });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    });

    expect(result.current.activeShortcut).toEqual(mockShortcuts[0]);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    });

    expect(result.current.activeShortcut).toBeNull();
  });
});