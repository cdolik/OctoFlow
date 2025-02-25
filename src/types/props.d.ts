import { Stage } from './index';
import { AssessmentError, ErrorContext } from './errors';
import { UserPreferences } from './user';
import { KeyboardShortcut } from './keyboard';
import type { ReactNode } from 'react';

export interface AssessmentProps {
  stage: Stage;
  onComplete?: () => void;
  onError?: (error: AssessmentError) => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  onRecover?: () => void | Promise<void>;
  fallback?: ReactNode;
}

export interface SaveIndicatorProps {
  state: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
}

export interface KeyboardShortcutHelperProps {
  shortcuts: KeyboardShortcut[];
  stage?: Stage;
}

export interface NavigationGuardProps {
  when: boolean;
  message?: string;
  onBeforeUnload?: () => boolean;
  children: ReactNode;
}

export interface AutoSaveProps {
  state: unknown;
  onSave: () => Promise<boolean>;
  interval?: number;
  enabled?: boolean;
}

export interface LiveRegionProps {
  children: ReactNode;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
}

export interface StageTransitionProps {
  from: string;
  to: string;
  onTransitionComplete: () => void;
  duration?: number;
  children?: ReactNode;
}

export interface AudioFeedbackProps {
  children: ReactNode;
  enabled?: boolean;
  onPlay?: (soundType: string) => void;
}

export interface PreferencesPanelProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: Partial<UserPreferences>) => void;
  onClose?: () => void;
}