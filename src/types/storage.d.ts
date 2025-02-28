import type { Stage } from './index';
import type { UserPreferences } from './user';

export interface StorageProgress {
  questionIndex: number;
  totalQuestions: number;
  isComplete: boolean;
}

export interface StorageMetadata {
  lastSaved: string;
  lastTransition?: string;
  stageStartTime?: number;
  timeSpent: number;
  attemptCount: number;
  lastInteraction?: number;
  categoryTimes?: Record<string, number>;
  metrics?: { averageResponseTime: number; completionRate: number };
  recommendations?: string[];
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