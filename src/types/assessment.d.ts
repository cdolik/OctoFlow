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

export interface AssessmentState {
  stage: string;
  responses: Record<string, number>;
  metadata: {
    startTime: number;
    lastSaved: number;
    questionCount: number;
  };
}

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