export type SoundType = 'success' | 'error' | 'warning' | 'info' | 'navigation' | 'complete';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category?: string;
  warning?: string;
  allowInErrorState?: boolean;
}

export interface KeyboardNavigationConfig {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
  onRetry?: () => void;
  soundEnabled?: boolean;
  stage?: string;
}

export interface UseKeyboardNavigationResult {
  focusedIndex: number;
  handleKeyDown: (event: KeyboardEvent) => void;
  navigateToNext: () => void;
  navigateToPrevious: () => void;
  reset: () => void;
}