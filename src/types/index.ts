export enum Stage {
  Welcome = 'welcome',
  Assessment = 'assessment',
  Results = 'results',
  Summary = 'summary',
  PreSeed = 'pre-seed',
  Seed = 'seed',
  SeriesA = 'series-a',
  SeriesB = 'series-b'
}

export interface Question {
  id: string;
  text: string;
  stage: Stage;
  category: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  weight: number;
  focusAreas: string[];
  questions: Question[];
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  steps: string[];
  githubUrl: string;
  stage: 'seed' | 'series-a' | 'series-b';
  applicableScores: {
    [key: string]: [number, number]; // [min, max] score range
  };
}

export interface StorageState {
  currentStage: Stage;
  responses: Record<string, { value: boolean; timestamp: number }>;
  scores?: Record<string, number>;
}

export interface StorageMetadata {
  lastSaved: string;
  lastInteraction?: number;
  stage?: Stage;
  questionCount?: number;
  metrics?: Record<string, unknown>;
}

export interface ResultsProps {
  onStartOver?: () => void;
}

export interface AssessmentProps {
  stage: Stage;
  onComplete?: () => void;
}

export interface ErrorContext {
  component: string;
  action: string;
  message: string;
}

// Re-export types from keyboard.d.ts
export type { KeyboardShortcut } from './keyboard';