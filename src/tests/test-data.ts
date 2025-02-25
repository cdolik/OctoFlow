import type { UserPreferences, StorageState, KeyboardShortcut } from '../types';

export const mockPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  highContrast: false,
  motionReduced: false,
  soundEnabled: true,
  keyboardMode: 'basic',
  autoSave: true,
  autoSaveInterval: 30
};

export const mockStorageState: StorageState = {
  version: '1.0',
  currentStage: 'pre-seed',
  responses: {},
  metadata: {
    lastSaved: new Date().toISOString(),
    timeSpent: 0,
    attemptCount: 1
  },
  progress: {
    questionIndex: 0,
    totalQuestions: 10,
    isComplete: false
  }
};

export const mockKeyboardShortcuts: KeyboardShortcut[] = [
  {
    key: 'n',
    description: 'Next question',
    action: () => {},
    category: 'Navigation'
  },
  {
    key: 'p',
    description: 'Previous question',
    action: () => {},
    category: 'Navigation'
  },
  {
    key: 's',
    description: 'Save progress',
    action: () => {},
    category: 'Actions'
  }
];

export const generateMockError = (message: string) => {
  const error = new Error(message);
  error.stack = `Error: ${message}
    at Component (/fake/path/Component.tsx:10:10)
    at ErrorBoundary (/fake/path/ErrorBoundary.tsx:20:20)`;
  return error;
};