import { Stage } from './index';
import { KeyboardShortcut } from './flowValidation';

export interface UseStageTransitionConfig {
  stage: Stage;
  responses: Record<string, number>;
  onComplete?: (stage: Stage) => void;
  onError?: (error: Error) => void;
}

export interface UseAutoScrollConfig {
  elementRef: React.RefObject<HTMLElement>;
  enabled?: boolean;
  offset?: number;
  behavior?: ScrollBehavior;
}

export interface UseKeyboardNavigationConfig {
  onNext: () => void;
  onBack: () => void;
  onSelect?: (index: number) => void;
  shortcuts?: KeyboardShortcut[];
  disabled?: boolean;
}

export interface UseSessionGuardConfig {
  redirectPath?: string;
  requireAuth?: boolean;
  persistSession?: boolean;
}

export interface UseAutoScrollResult {
  scrollToElement: () => void;
  isScrolling: boolean;
  error: Error | null;
}

export interface UseStageTransitionResult {
  isTransitioning: boolean;
  progress: number;
  error: Error | null;
  startTransition: (targetStage: Stage) => boolean;
  cancelTransition: () => void;
}

export interface UseKeyboardNavigationResult {
  currentFocus: number;
  setFocus: (index: number) => void;
  resetFocus: () => void;
}

export interface UseSessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
  error: Error | null;
  renewSession: () => Promise<boolean>;
}