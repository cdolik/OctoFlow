export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type KeyboardMode = 'basic' | 'advanced';

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: FontSize;
  highContrast: boolean;
  motionReduced: boolean;
  soundEnabled: boolean;
  keyboardMode: KeyboardMode;
  autoSave: boolean;
  autoSaveInterval: number;
  [key: string]: string | number | boolean; // Allow for future preference additions
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  lastActive?: string;
  lastSynced?: string;
}

export interface UserState {
  preferences: UserPreferences;
  lastActive: string;
  initialized: boolean;
}

export interface UseStorageOptions {
  autoSave?: boolean;
  backupInterval?: number;
  onError?: (error: Error) => void;
}