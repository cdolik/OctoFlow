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
    questionFilter: (q: Question) => ['branch-strategy', 'pr-review', 'ci-practices'].includes(q.id)
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
    questionFilter: (q: Question) => true
  },
  'series-a': {
    id: 'series-a',
    label: 'Series A',
    description: 'Scale engineering processes and security',
    focus: ['scale', 'security'],
    benchmarks: {
      deploymentFreq: '3/day',
      securityLevel: 3,
      costEfficiency: 0.6,
      expectedScores: {
        'github-ecosystem': 3.5,
        'security': 3.0,
        'automation': 3.5
      }
    },
    questionFilter: (q: Question) => true
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

export const StageConfig: Record<Stage, StageDefinition> = {
  'pre-seed': {
    id: 'pre-seed',
    title: 'Pre-Seed Stage',
    focus: ['CI/CD Basics', 'Code Review', 'Security Essentials'],
    benchmarks: {
      expectedScores: {
        'github-ecosystem': 0.5,
        'workflow': 0.4,
        'automation': 0.3,
        'security': 0.6,
        'release': 0.3,
        'governance': 0.2,
        'optimization': 0.2
      }
    }
  },
  'seed': {
    id: 'seed',
    title: 'Seed Stage',
    focus: ['Branch Protection', 'Team Collaboration', 'Deployment Strategy'],
    benchmarks: {
      expectedScores: {
        'github-ecosystem': 0.7,
        'workflow': 0.6,
        'automation': 0.5,
        'security': 0.7,
        'release': 0.5,
        'governance': 0.4,
        'optimization': 0.4
      }
    }
  },
  'series-a': {
    id: 'series-a',
    title: 'Series A',
    focus: ['Team Scaling', 'Compliance', 'Advanced Security'],
    benchmarks: {
      expectedScores: {
        'github-ecosystem': 0.8,
        'workflow': 0.8,
        'automation': 0.7,
        'security': 0.9,
        'release': 0.7,
        'governance': 0.6,
        'optimization': 0.6
      }
    }
  },
  'series-b': {
    id: 'series-b',
    title: 'Series B',
    focus: ['Enterprise Scale', 'Advanced Security', 'Full Automation'],
    benchmarks: {
      expectedScores: {
        'github-ecosystem': 0.9,
        'workflow': 0.9,
        'automation': 0.9,
        'security': 1.0,
        'release': 0.8,
        'governance': 0.8,
        'optimization': 0.8
      }
    }
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