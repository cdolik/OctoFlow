import { Stage, StageDefinition, Question } from '../types';

export const STAGE_CONFIG: Record<Stage, StageDefinition> = {
  'pre-seed': {
    id: 'pre-seed',
    label: 'Pre-Seed Stage',
    title: 'Pre-Seed Stage',
    description: 'Focus on establishing basic GitHub workflows and automation',
    focus: ['CI/CD Basics', 'Code Review', 'Security Essentials'],
    benchmarks: {
      deploymentFreq: '2/week',
      securityLevel: 1,
      costEfficiency: 0.8,
      expectedScores: {
        'github-ecosystem': 0.5,
        'workflow': 0.4,
        'automation': 0.3,
        'security': 0.6,
        'release': 0.3,
        'governance': 0.2,
        'optimization': 0.2
      }
    },
    questionFilter: (q: Question) => ['branch-strategy', 'pr-review', 'ci-practices'].includes(q.id)
  },
  'seed': {
    id: 'seed',
    label: 'Seed Stage',
    title: 'Seed Stage',
    description: 'Raised seed funding, building MVP',
    focus: ['Branch Protection', 'Team Collaboration', 'Deployment Strategy'],
    benchmarks: {
      deploymentFreq: '1/day',
      securityLevel: 2,
      costEfficiency: 0.7,
      expectedScores: {
        'github-ecosystem': 0.7,
        'workflow': 0.6,
        'automation': 0.5,
        'security': 0.7,
        'release': 0.5,
        'governance': 0.4,
        'optimization': 0.4
      }
    },
    questionFilter: (_q: Question) => true // Using _q to indicate unused parameter
  },
  'series-a': {
    id: 'series-a',
    label: 'Series A',
    title: 'Series A',
    description: 'Scale engineering processes and security',
    focus: ['Team Scaling', 'Compliance', 'Advanced Security'],
    benchmarks: {
      deploymentFreq: '3/day',
      securityLevel: 3,
      costEfficiency: 0.6,
      expectedScores: {
        'github-ecosystem': 0.8,
        'workflow': 0.8,
        'automation': 0.7,
        'security': 0.9,
        'release': 0.7,
        'governance': 0.6,
        'optimization': 0.6
      }
    },
    questionFilter: (_q: Question) => true
  },
  'series-b': {
    id: 'series-b',
    label: 'Series B+',
    title: 'Series B',
    description: 'Optimize workflows and implement advanced governance',
    focus: ['Enterprise Scale', 'Advanced Security', 'Full Automation'],
    benchmarks: {
      deploymentFreq: 'on-demand',
      securityLevel: 4,
      costEfficiency: 0.5,
      expectedScores: {
        'github-ecosystem': 0.9,
        'workflow': 0.9,
        'automation': 0.9,
        'security': 1.0,
        'release': 0.8,
        'governance': 0.8,
        'optimization': 0.8
      }
    },
    questionFilter: (_q: Question) => true
  }
};

// Utility functions for stage management
export const getStageConfig = (stage: Stage): StageDefinition => {
  const config = STAGE_CONFIG[stage];
  if (!config) {
    throw new Error(`Invalid stage: ${stage}`);
  }
  return config;
};

export const validateStageSequence = (fromStage: Stage | null, toStage: Stage): boolean => {
  if (!fromStage) return true; // Initial stage selection is always valid
  
  const stages: Stage[] = Object.keys(STAGE_CONFIG) as Stage[];
  const fromIndex = stages.indexOf(fromStage);
  const toIndex = stages.indexOf(toStage);
  
  return toIndex <= fromIndex + 1; // Allow moving to next stage or any previous stage
};

export const getNextStage = (currentStage: Stage): Stage | null => {
  const stages = Object.keys(STAGE_CONFIG) as Stage[];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};

export const getPreviousStage = (currentStage: Stage): Stage | null => {
  const stages = Object.keys(STAGE_CONFIG) as Stage[];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex > 0 ? stages[currentIndex - 1] : null;
};