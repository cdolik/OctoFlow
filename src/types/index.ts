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
}

export interface StorageMetadata {
  lastSaved: string;
  lastTransition?: string;
  stageStartTime?: number;
  timeSpent: number;
  attemptCount: number;
  lastInteraction?: number;
  categoryTimes?: Record<string, number>;
}

export interface StorageProgress {
  questionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
  lastUpdated?: string;
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
    responses: Record<string, number>;
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
  questions: Question[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  effort: 'High' | 'Medium' | 'Low';
  impact: number;
  category: string;
  stage: Stage;
}

export interface ScoreResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  level: 'Low' | 'Medium' | 'High';
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
