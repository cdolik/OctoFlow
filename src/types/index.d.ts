export type Stage = 'pre-seed' | 'seed' | 'series-a';
export type StageType = 'assessment' | 'summary' | 'results';

export interface Responses {
  [key: string]: number;
}

export interface StageInfo {
  id: Stage;
  name: string;
}

export interface FlowValidationProps {
  currentStage: Stage;
  responses: Record<Stage, Responses>;
  stages: Stage[];
}

export interface SessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  fromStage?: Stage;
  toStage?: Stage;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action?: () => void;
}

export interface StageKeyboardConfig {
  shortcuts: KeyboardShortcut[];
  advancedShortcuts?: KeyboardShortcut[];
}

export interface FlowResumptionPoint {
  stage: Stage | null;
  questionIndex: number;
  completed: boolean;
}

export interface StageValidationResult {
  isValid: boolean;
  error?: string;
  details?: string[];
}

export interface ComponentFlowProps extends FlowValidationProps {
  stage: StageInfo;
  onKeyboardShortcut?: (shortcut: KeyboardShortcut) => void;
  transitionState?: TransitionState;
}