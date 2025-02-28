export type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b';

export interface StageDefinition {
  id: Stage;
  label: string;
  title: string;
  description: string;
  focus: string[];
  benchmarks: {
    deploymentFreq: string;
    securityLevel: number;
    costEfficiency: number;
    expectedScores: Record<string, number>;
  };
  questionFilter: (q: Question) => boolean;
  scoringCriteria?: {
    threshold: number;
    minResponses?: number;
  };
}

export interface StorageMetadata {
  lastSaved: string;
  lastTransition?: string;
  stageStartTime?: number;
  timeSpent: number;
  attemptCount: number;
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
  metadata: StorageMetadata;
  progress: StorageProgress;
}

export interface AssessmentState extends StorageState {
  preferences?: UserPreferences;
  stages?: Record<Stage, {
    isComplete: boolean;
    responses?: Record<string, number>;
    score?: number;
  }>;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  allowInErrorState?: boolean;
}

export interface StageValidationResult {
  isValid: boolean;
  error?: string;
  details?: string[];
  redirectTo?: string;
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
  tooltipTerm?: string;
}

export interface Category {
  id: string;
  title: string;
  weight: number;
  description: string;
  questions?: Question[];
  focusAreas?: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  effort: 'High' | 'Medium' | 'Low';
  impact: number;
  category: string;
  stage: Stage;
  details?: string;
  priority?: number;
  steps?: string[];
  resource?: string;
}

export type ScoreLevel = 'Low' | 'Medium' | 'High';

export interface ScoreResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  level: ScoreLevel;
  gaps: Record<string, number>;
  benchmarks: Record<string, number>;
  completionRate: number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  examples?: string[];
  category?: string;
}

export type AssessmentResponse = {
  value: number;
  timestamp: string;
  timeSpent: number;
};

export interface FlowValidationProps {
  stage: Stage;
  onValidationComplete?: () => void;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type SoundType = 'success' | 'error' | 'warning' | 'info' | 'navigation' | 'complete';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  motionReduced: boolean;
  audioEnabled: boolean;
  autoSaveInterval: number;
  developerMode: boolean;
}

export interface ErrorContext {
  component: string;
  action: string;
  message: string;
}
