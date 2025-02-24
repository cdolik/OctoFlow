import React, { useCallback } from 'react';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import { useStorage } from '../hooks/useStorage';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  highContrast: boolean;
  motionReduced: boolean;
  keyboardMode: 'basic' | 'vim' | 'emacs';
  autoSave: boolean;
  autoSaveInterval: number;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  soundEnabled: true,
  highContrast: false,
  motionReduced: false,
  keyboardMode: 'basic',
  autoSave: true,
  autoSaveInterval: 30000
};

interface UserPreferencesProps {
  onUpdate?: (preferences: UserPreferences) => void;
  children: React.ReactNode;
}

export function UserPreferences({ onUpdate, children }: UserPreferencesProps): JSX.Element {
  const { state, saveState } = useStorage();
  const { playSound } = useAudioFeedback();

  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!state) return;

    const currentPreferences = (state.preferences as UserPreferences) || defaultPreferences;
    const newPreferences = {
      ...currentPreferences,
      [key]: value
    };

    const success = await saveState({
      ...state,
      preferences: newPreferences
    });

    if (success) {
      playSound('success');
      onUpdate?.(newPreferences);
    } else {
      playSound('error');
    }
  }, [state, saveState, playSound, onUpdate]);

  const preferences = (state?.preferences as UserPreferences) || defaultPreferences;

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
      <LiveRegion>
        Preferences loaded: {Object.keys(preferences).length} settings available
      </LiveRegion>
    </UserPreferencesContext.Provider>
  );
}

// Context for user preferences
interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
}

export const UserPreferencesContext = React.createContext<UserPreferencesContextType | null>(null);

// Custom hook for using user preferences
export function useUserPreferences() {
  const context = React.useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferences provider');
  }
  return context;
}