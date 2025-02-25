import { renderHook } from '@testing-library/react';
import { useGlobalShortcuts } from './useGlobalShortcuts';
import { KeyboardShortcut } from '../types';

describe('useGlobalShortcuts', () => {
  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      description: 'Next',
      action: jest.fn()
    },
    {
      key: 'p',
      description: 'Previous',
      action: jest.fn()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers shortcut actions on keydown', () => {
    renderHook(() => useGlobalShortcuts(mockShortcuts));
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    
    expect(mockShortcuts[0].action).toHaveBeenCalled();
  });

  it('ignores shortcut when typing in form elements', () => {
    renderHook(() => useGlobalShortcuts(mockShortcuts));
    
    // Create and focus an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    const event = new KeyboardEvent('keydown', { key: 'n', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    document.dispatchEvent(event);
    
    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
    
    // Cleanup
    document.body.removeChild(input);
  });

  it('clears active shortcut on keyup', () => {
    const { result } = renderHook(() => useGlobalShortcuts(mockShortcuts));
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    expect(result.current.activeShortcut).toBe(mockShortcuts[0]);
    
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'n' }));
    expect(result.current.activeShortcut).toBeNull();
  });

  it('handles shortcut enabling and disabling', () => {
    const { result } = renderHook(() => useGlobalShortcuts(mockShortcuts));
    
    // Disable shortcuts
    result.current.disableShortcuts();
    expect(result.current.isEnabled).toBe(false);
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    expect(mockShortcuts[0].action).not.toHaveBeenCalled();
    
    // Enable shortcuts
    result.current.enableShortcuts();
    expect(result.current.isEnabled).toBe(true);
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    expect(mockShortcuts[0].action).toHaveBeenCalled();
  });

  it('toggles shortcuts state', () => {
    const { result } = renderHook(() => useGlobalShortcuts(mockShortcuts));
    
    expect(result.current.isEnabled).toBe(true);
    
    result.current.toggleShortcuts();
    expect(result.current.isEnabled).toBe(false);
    
    result.current.toggleShortcuts();
    expect(result.current.isEnabled).toBe(true);
  });

  it('calls onShortcutTriggered callback', () => {
    const onShortcutTriggered = jest.fn();
    renderHook(() => 
      useGlobalShortcuts(mockShortcuts, { onShortcutTriggered })
    );
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    
    expect(onShortcutTriggered).toHaveBeenCalledWith(mockShortcuts[0]);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useGlobalShortcuts(mockShortcuts));
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2); // keydown and keyup
  });

  it('handles case-insensitive shortcuts', () => {
    renderHook(() => useGlobalShortcuts(mockShortcuts));
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'N' }));
    
    expect(mockShortcuts[0].action).toHaveBeenCalled();
  });
});
