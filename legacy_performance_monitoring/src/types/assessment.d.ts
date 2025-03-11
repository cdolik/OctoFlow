import { Stage } from './index';

export interface Question {
  id: string;
  text: string;
  tooltipTerm?: string;
  category: string;
  weight: number;
  stages: Array<'pre-seed' | 'seed' | 'series-a' | 'series-b'>;
  options: Array<{
    value: number;
    text: string;
  }>;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  weight: number;
  focusAreas: string[];
}

export interface StageConfig {
  id: 'pre-seed' | 'seed' | 'series-a';
  label: string;
  description: string;
  benchmarks: {
    deploymentFreq: string;
    securityLevel: number;
    costEfficiency: number;
    expectedScores: Record<string, number>;
  };
  questionFilter: (question: Question) => boolean;
}

export interface AssessmentProgress {
  questionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
  lastUpdated: string;
}

export interface AssessmentMetadata {
  startTime: number;
  lastInteraction: number;
  completedCategories: string[];
  categoryScores: Record<string, number>;
}

export interface AssessmentResponse {
  value: number;
  timestamp: number;
  questionId: string;
  category: string;
  timeSpent: number;
}

export interface AssessmentState {
  stage: Stage;
  responses: Record<string, AssessmentResponse>;
  progress: AssessmentProgress;
  metadata: AssessmentMetadata;
}

export interface AssessmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  invalidScores: string[];
}

export interface CategoryProgress {
  id: string;
  completed: number;
  total: number;
  scores: number[];
  averageScore: number;
}

export type AssessmentSaveStatus = 
  | { status: 'saved'; timestamp: number }
  | { status: 'saving' }
  | { status: 'error'; error: Error };

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'High' | 'Medium' | 'Low';
  impact: string;
  steps: string[];
  resource: string;
  minScore: number;
  targetScore: number;
  stageRequirement?: 'pre-seed' | 'seed' | 'series-a' | 'series-b';
}