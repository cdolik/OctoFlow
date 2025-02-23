import { Stage, StageDefinition, Question } from '../types';

export const STAGE_CONFIG: Record<Stage, StageDefinition> = {
  'pre-seed': {
    id: 'pre-seed',
    label: 'Pre-Seed Startup',
    description: 'Focus on establishing basic GitHub workflows and automation',
    focus: ['workflow', 'automation'],
    benchmarks: {
      deploymentFreq: '2/week',
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
  'seed': {
    id: 'seed',
    label: 'Seed Stage',
    description: 'Raised seed funding, building MVP',
    focus: ['security', 'release'],
    benchmarks: {
      deploymentFreq: '1/day',
      securityLevel: 2,
      costEfficiency: 0.7,
      expectedScores: {
        'github-ecosystem': 2.5,
        'security': 2.5,
        'automation': 2.0
      }
    },
    questionFilter: (q: Question) => ['security', 'deployment', 'collaboration'].includes(q.category)
  },
  'series-a': {
    id: 'series-a',
    label: 'Series A',
    description: 'Scaling operations and team',
    focus: ['security', 'release', 'governance'],
    benchmarks: {
      deploymentFreq: 'multiple/day',
      securityLevel: 3,
      costEfficiency: 0.6,
      expectedScores: {
        'github-ecosystem': 3.5,
        'security': 3.0,
        'automation': 3.0
      }
    },
    questionFilter: (q: Question) => true // All questions applicable
  },
  'series-b': {
    id: 'series-b',
    label: 'Series B+',
    description: 'Optimize workflows and implement advanced governance',
    focus: ['governance', 'optimization'],
    benchmarks: {
      deploymentFreq: 'on-demand',
      securityLevel: 4,
      costEfficiency: 0.5,
      expectedScores: {
        'github-ecosystem': 4.0,
        'security': 4.0,
        'automation': 4.0
      }
    },
    questionFilter: (q: Question) => true
  }
};

export const getStageConfig = (stage: Stage): StageDefinition => {
  const config = STAGE_CONFIG[stage];
  if (!config) {
    throw new Error(`Invalid stage: ${stage}`);
  }
  return config;
};

export const validateStageSequence = (fromStage: Stage | null, toStage: Stage): boolean => {
  if (!fromStage) return true; // Initial stage selection is always valid
  
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const fromIndex = stages.indexOf(fromStage);
  const toIndex = stages.indexOf(toStage);
  
  return toIndex <= fromIndex + 1; // Allow moving to next stage or any previous stage
};

export const getNextStage = (currentStage: Stage): Stage | null => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};

export const getPreviousStage = (currentStage: Stage): Stage | null => {
  const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex > 0 ? stages[currentIndex - 1] : null;
};