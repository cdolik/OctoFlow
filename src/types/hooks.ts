import { KeyboardShortcut, Stage, StorageState, AssessmentState } from './index';
import { ErrorResult } from './errors';

export interface UseKeyboardNavigationConfig {
  stage?: Stage;
  onNext?: () => void;
  onPrevious?: () => void;
  onEscape?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  shortcuts?: KeyboardShortcut[];
  isEnabled?: boolean;
  enableArrowKeys?: boolean;
  focusSelector?: string;
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;
  allowInErrorState?: boolean;
}

export interface UseStorageConfig {
  autoSave?: boolean;
  backupInterval?: number;
}

export interface UseStorageResult {
  state: StorageState | null;
  saveState: (newState: StorageState) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseAssessmentSessionResult {
  state: AssessmentState | null;
  saveStatus: {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: string;
    error?: Error;
  };
  isLoading: boolean;
  error: Error | null;
  saveResponse: (questionId: number, value: number, timeSpent: number) => Promise<boolean>;
  completeSession: () => Promise<boolean>;
}

export interface UseErrorResult {
  error: Error | null;
  handleError: (error: Error) => Promise<ErrorResult>;
  clearError: () => void;
}

export interface UseSessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
  error: Error | null;
  renewSession: () => Promise<boolean>;
}

export interface UseErrorManagementResult {
  handleError: (error: unknown, recover?: () => Promise<boolean>) => Promise<boolean>;
  clearError: () => void;
  error: Error | null;
}