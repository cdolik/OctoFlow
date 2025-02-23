import { useCallback, useEffect, useState } from 'react';
import { KeyboardShortcut } from '../types';

interface ShortcutOptions {
  isEnabled?: boolean;
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;
}

interface ShortcutState {
  activeShortcut: KeyboardShortcut | null;
  isEnabled: boolean;
}

export const useGlobalShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: ShortcutOptions = {}
) => {
  const { isEnabled = true, onShortcutTriggered } = options;

  const [state, setState] = useState<ShortcutState>({
    activeShortcut: null,
    isEnabled
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isEnabled) return;

    // Don't trigger shortcuts when typing in form elements
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const shortcut = shortcuts.find(s => {
      if (typeof s.key === 'string') {
        return s.key.toLowerCase() === event.key.toLowerCase();
      }
      return false;
    });

    if (shortcut) {
      event.preventDefault();
      setState(prev => ({ ...prev, activeShortcut: shortcut }));
      shortcut.action();
      onShortcutTriggered?.(shortcut);
    }
  }, [shortcuts, state.isEnabled, onShortcutTriggered]);

  const clearActiveShortcut = useCallback(() => {
    setState(prev => ({ ...prev, activeShortcut: null }));
  }, []);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', clearActiveShortcut);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', clearActiveShortcut);
    };
  }, [isEnabled, handleKeyDown, clearActiveShortcut]);

  const enableShortcuts = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: true }));
  }, []);

  const disableShortcuts = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: false }));
  }, []);

  const toggleShortcuts = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  return {
    activeShortcut: state.activeShortcut,
    isEnabled: state.isEnabled,
    enableShortcuts,
    disableShortcuts,
    toggleShortcuts
  };
};