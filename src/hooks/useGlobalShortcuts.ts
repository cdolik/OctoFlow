import { useEffect, useCallback, useRef } from 'react';
import { KeyboardShortcut } from '../types/flowValidation';

interface ShortcutConfig {
  shortcuts: KeyboardShortcut[];
  disabled?: boolean;
  enableInInputs?: boolean;
}

export const useGlobalShortcuts = ({
  shortcuts,
  disabled = false,
  enableInInputs = false
}: ShortcutConfig) => {
  const activeShortcuts = useRef(shortcuts);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Skip if we're in an input and shortcuts aren't enabled for inputs
    if (
      !enableInInputs &&
      (event.target as HTMLElement).tagName.match(/^(INPUT|TEXTAREA)$/i)
    ) {
      return;
    }

    activeShortcuts.current.forEach(shortcut => {
      const keys = shortcut.key.toLowerCase().split('+');
      const mainKey = keys[keys.length - 1];
      const requiresCtrl = keys.includes('ctrl');
      const requiresShift = keys.includes('shift');
      const requiresAlt = keys.includes('alt');

      if (
        event.key.toLowerCase() === mainKey &&
        event.ctrlKey === requiresCtrl &&
        event.shiftKey === requiresShift &&
        event.altKey === requiresAlt
      ) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [disabled, enableInInputs]);

  useEffect(() => {
    activeShortcuts.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    activeShortcuts.current = [...activeShortcuts.current, shortcut];
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    activeShortcuts.current = activeShortcuts.current.filter(s => s.key !== key);
  }, []);

  return {
    registerShortcut,
    unregisterShortcut
  };
};