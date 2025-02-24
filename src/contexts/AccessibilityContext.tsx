import React, { createContext, useContext, useCallback, useState } from 'react';
import { useUserPreferences } from '../components/UserPreferences';

interface AccessibilityContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusTarget: (elementId: string) => void;
  clearFocusTarget: () => void;
  currentFocus: string | null;
  lastAnnouncement: string | null;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useUserPreferences();
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or update announcement element
    let announcer = document.getElementById(`accessibility-announcer-${priority}`);
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = `accessibility-announcer-${priority}`;
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.padding = '0';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.whiteSpace = 'nowrap';
      announcer.style.border = '0';
      document.body.appendChild(announcer);
    }

    // Clear and re-add content to trigger announcement
    announcer.textContent = '';
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = message;
        setLastAnnouncement(message);
      }
    }, 100);
  }, []);

  const setFocusTarget = useCallback((elementId: string) => {
    setCurrentFocus(elementId);
    const element = document.getElementById(elementId);
    if (element && element.focus) {
      // Add focus outline if keyboard mode is active
      if (preferences.keyboardMode !== 'basic') {
        element.style.outline = '2px solid var(--focus-ring-color)';
        element.style.outlineOffset = '2px';
      }
      element.focus();
    }
  }, [preferences.keyboardMode]);

  const clearFocusTarget = useCallback(() => {
    if (currentFocus) {
      const element = document.getElementById(currentFocus);
      if (element) {
        element.style.outline = '';
        element.style.outlineOffset = '';
      }
    }
    setCurrentFocus(null);
  }, [currentFocus]);

  return (
    <AccessibilityContext.Provider 
      value={{
        announce,
        setFocusTarget,
        clearFocusTarget,
        currentFocus,
        lastAnnouncement
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}