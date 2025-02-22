import { StageConfig, Stage, WafPillar, Question } from '../types';

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

export interface StageDefinition extends StageConfig {
  id: Stage;
  label: string;
  description: string;
  focus: string[];
  benchmarks: StageBenchmarks;
  questionFilter: (q: Question) => boolean;
}

// Single source of truth for all stage-related configuration
export const stages: StageDefinition[] = [
  {
    id: "pre-seed",
    label: "Pre-Seed Startup",
    description: "Focus on establishing basic GitHub workflows and automation",
    focus: ['workflow', 'automation'],
    benchmarks: {
      deploymentFreq: "2/week",
      securityLevel: 1,
      costEfficiency: 0.8,
      expectedScores: {
        'github-ecosystem': 2.0,
        'security': 1.5,
        'automation': 1.5
      }
    },
    questionFilter: (q: Question) => {
      return ['branch-strategy', 'pr-review', 'ci-practices'].includes(q.id);
    }
  },
  {
    id: "seed",
    label: "Seed Stage",
    description: "Raised seed funding, building MVP",
    focus: ['security', 'release'],
    benchmarks: {
      deploymentFreq: "1/day",
      securityLevel: 2,
      costEfficiency: 0.7,
      expectedScores: {
        'github-ecosystem': 2.5,
        'security': 2.5,
        'automation': 2.0
      }
    },
    questionFilter: (_q: Question) => true // Include all questions
  },
  {
    id: "series-a",
    label: "Series A",
    description: "Scaling operations and team",
    focus: ['security', 'release'],
    benchmarks: {
      deploymentFreq: "multiple/day",
      securityLevel: 3,
      costEfficiency: 0.6,
      expectedScores: {
        'github-ecosystem': 3.5,
        'security': 3.0,
        'automation': 3.0
      }
    },
    questionFilter: (_q: Question) => true
  },
  {
    id: "series-b",
    label: "Series B+",
    description: "Optimize workflows and implement advanced governance",
    focus: ['governance', 'optimization'],
    benchmarks: {
      deploymentFreq: "on-demand",
      securityLevel: 4,
      costEfficiency: 0.5,
      expectedScores: {
        'github-ecosystem': 4.0,
        'security': 4.0,
        'automation': 4.0
      }
    },
    questionFilter: (_q: Question) => true
  }
];

// Helper functions for stage operations
export const getStage = (stageId: Stage): StageDefinition | undefined => 
  stages.find(s => s.id === stageId);

export const getStageQuestions = (stage: Stage, questions: Question[]): Question[] =>
  questions.filter(q => stages.find(s => s.id === stage)?.questionFilter(q));

export const WAF_PILLARS: WafPillar[] = [
  {
    id: 'security',
    title: 'Security & Compliance',
    questions: [
      {
        id: 'dependabot',
        text: 'How do you manage dependency vulnerabilities?',
        options: [
          { value: 1, text: 'No automated vulnerability checking' },
          { value: 2, text: 'Manual periodic checks' },
          { value: 3, text: 'Dependabot alerts enabled' },
          { value: 4, text: 'Dependabot with auto-PRs and CI integration' }
        ]
      },
      {
        id: 'branch-protection',
        text: 'How are your branches protected?',
        options: [
          { value: 1, text: 'No branch protection' },
          { value: 2, text: 'Basic branch protection rules' },
          { value: 3, text: 'Required reviews and status checks' },
          { value: 4, text: 'Advanced protection with required signatures' }
        ]
      }
    ]
  }
];