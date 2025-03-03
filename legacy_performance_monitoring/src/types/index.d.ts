export type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b';
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
  error: Error | null;
  fromStage?: Stage;
  toStage?: Stage;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
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
  redirectTo?: string;
}

export interface ComponentFlowProps extends FlowValidationProps {
  stage: Stage;
  onKeyboardShortcut?: (shortcut: KeyboardShortcut) => void;
  transitionState?: TransitionState;
}

export interface StageBenchmarks {
  deploymentFreq: string;
  securityLevel: number;
  costEfficiency: number;
  expectedScores: {
    'github-ecosystem': number;
    'security': number;
    'automation': number;
  };
}

export interface StageDefinition {
  id: Stage;
  label: string;
  description: string;
  focus: string[];
  benchmarks: StageBenchmarks;
  questionFilter: (q: Question) => boolean;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  weight: number;
  stages: Stage[];
  options: Array<{
    value: number;
    text: string;
  }>;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  weight?: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'High' | 'Medium' | 'Low';
  category: string;
  steps: string[];
}

export interface UseSessionGuardConfig {
  redirectPath?: string;
  requireAuth?: boolean;
  persistSession?: boolean;
}

export interface UseSessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
}

export interface StageConfig extends Omit<StageDefinition, 'id'> {
  id: Stage;
}

export interface WafPillar {
  id: string;
  title: string;
  questions: Question[];
}

export interface ScoreLevel {
  level: 'Initial' | 'Basic' | 'Proactive' | 'Advanced';
  description: string;
}

export interface ScoreResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  benchmarks: Record<string, number>;
  completionRate: number;
  gaps: string[];
}

export interface StageScores {
  overallScore: number;
  categoryScores: Record<string, number>;
  recommendations: string[];
}

export interface StorageProgress {
  questionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
}

export interface StorageState {
  version: string;
  currentStage: Stage | null;
  responses: Record<string, number>;
  metadata: {
    lastSaved: string;
    lastTransition?: string;
    stageStartTime?: number;
    timeSpent: number;
    attemptCount: number;
    lastInteraction?: number;
    categoryTimes?: Record<string, number>;
  };
  progress: StorageProgress;
}

export interface AssessmentState extends StorageState {
  scores?: Record<string, number>;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  highContrast: boolean;
  motionReduced: boolean;
  keyboardMode: 'basic' | 'advanced';
  autoSave: boolean;
  autoSaveInterval: number;
}