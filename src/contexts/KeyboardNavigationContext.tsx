import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useUserPreferences } from '../components/UserPreferences';
import { useAudioFeedback } from '../components/AudioFeedback';
import { LiveRegion } from '../components/LiveRegion';

interface ShortcutMap {
  key: string;
  description: string;
  action: () => void;
  allowedModes?: ('basic' | 'vim' | 'emacs')[];
  requiresModifier?: boolean;
}

interface KeyboardNavigationContextType {
  registerShortcut: (shortcut: ShortcutMap) => void;
  unregisterShortcut: (key: string) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  currentMode: 'basic' | 'vim' | 'emacs';
  shortcuts: ShortcutMap[];
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | null>(null);

interface KeyboardNavigationProviderProps {
  children: React.ReactNode;
}

export function KeyboardNavigationProvider({ children }: KeyboardNavigationProviderProps) {
  const { preferences } = useUserPreferences();
  const { playSound } = useAudioFeedback();
  const [shortcuts, setShortcuts] = useState<ShortcutMap[]>([]);
  const [isEnabled, setEnabled] = useState(true);
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');

  const registerShortcut = useCallback((shortcut: ShortcutMap) => {
    setShortcuts(prev => [...prev, shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    const key = event.key.toLowerCase();
    const hasModifier = event.ctrlKey || event.metaKey;
    setLastKeyPressed(key);

    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === key;
      const modeMatches = !shortcut.allowedModes || 
        shortcut.allowedModes.includes(preferences.keyboardMode);
      const modifierMatches = shortcut.requiresModifier === hasModifier;
      
      return keyMatches && modeMatches && modifierMatches;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
      playSound('navigation');

      // Announce shortcut usage for screen readers
      const announcement = `Executed: ${matchingShortcut.description}`;
      const liveRegion = document.querySelector('[role="status"]');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [shortcuts, isEnabled, preferences.keyboardMode, playSound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const contextValue: KeyboardNavigationContextType = {
    registerShortcut,
    unregisterShortcut,
    isEnabled,
    setEnabled,
    currentMode: preferences.keyboardMode,
    shortcuts
  };

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      {children}
      <LiveRegion>
        {lastKeyPressed ? `Key pressed: ${lastKeyPressed}` : ''}
      </LiveRegion>
      {!isEnabled && (
        <div 
          role="alert" 
          className="keyboard-navigation-disabled"
          aria-live="assertive"
        >
          Keyboard navigation is currently disabled
          <style jsx>{`
            .keyboard-navigation-disabled {
              position: fixed;
              bottom: 1rem;
              right: 1rem;
              padding: 0.5rem 1rem;
              background: var(--warning-background);
              color: var(--warning-text);
              border-radius: 4px;
              font-size: 0.875rem;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
          `}</style>
        </div>
      )}
    </KeyboardNavigationContext.Provider>
  );
}

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
}