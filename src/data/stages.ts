import { Stage, StageConfig } from '../types';

export const stages: StageConfig[] = [
  {
    id: 'pre-seed',
    label: 'Pre-Seed',
    description: 'Teams of 1-5 developers focusing on MVP development',
    benchmarks: {
      deploymentFreq: 'Weekly',
      securityLevel: 1,
      costEfficiency: 2,
      expectedScores: {
        'github-ecosystem': 2.0,
        'security': 1.5,
        'ai-adoption': 1.0,
        'automation': 1.5
      }
    },
    questionFilter: question => !question.category.includes('ai-adoption') && question.weight <= 2
  },
  {
    id: 'seed',
    label: 'Seed',
    description: 'Teams of 5-15 developers scaling their infrastructure',
    benchmarks: {
      deploymentFreq: 'Daily',
      securityLevel: 2,
      costEfficiency: 3,
      expectedScores: {
        'github-ecosystem': 2.5,
        'security': 2.5,
        'ai-adoption': 2.0,
        'automation': 2.5
      }
    },
    questionFilter: question => question.weight <= 3
  },
  {
    id: 'series-a',
    label: 'Series A',
    description: 'Teams of 15+ developers optimizing for scale',
    benchmarks: {
      deploymentFreq: 'Multiple/Day',
      securityLevel: 3,
      costEfficiency: 4,
      expectedScores: {
        'github-ecosystem': 3.5,
        'security': 3.0,
        'ai-adoption': 2.5,
        'automation': 3.0
      }
    },
    questionFilter: question => true
  }
] as const;