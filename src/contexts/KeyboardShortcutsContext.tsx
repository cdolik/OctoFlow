import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { KeyboardShortcut } from '../types';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  activeShortcut: KeyboardShortcut | null;
  isEnabled: boolean;
  enableShortcuts: () => void;
  disableShortcuts: () => void;
  toggleShortcuts: () => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
  initialShortcuts?: KeyboardShortcut[];
  isEnabled?: boolean;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
  initialShortcuts = [],
  isEnabled = true
}) => {
  const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>(initialShortcuts);

  const {
    activeShortcut,
    isEnabled: shortcutsEnabled,
    enableShortcuts,
    disableShortcuts,
    toggleShortcuts
  } = useGlobalShortcuts(shortcuts, { isEnabled });

  const registerShortcut = React.useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Don't add if shortcut with same key already exists
      if (prev.some(s => s.key === shortcut.key)) {
        return prev;
      }
      return [...prev, shortcut];
    });
  }, []);

  const contextValue = useMemo(() => ({
    shortcuts,
    activeShortcut,
    isEnabled: shortcutsEnabled,
    enableShortcuts,
    disableShortcuts,
    toggleShortcuts,
    registerShortcut
  }), [
    shortcuts,
    activeShortcut,
    shortcutsEnabled,
    enableShortcuts,
    disableShortcuts,
    toggleShortcuts,
    registerShortcut
  ]);

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = (): KeyboardShortcutsContextType => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};