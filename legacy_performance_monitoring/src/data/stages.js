import { StageConfig, Stage, WafPillar } from '../types';

export const STAGE_CONFIG = {
  'pre-seed': {
    label: 'Pre-Seed',
    description: 'Focus on establishing basic GitHub workflows and automation',
    focus: ['workflow', 'automation'],
    questionFilter: (q) => {
      return ['branch-strategy', 'pr-review', 'ci-practices'].includes(q.id);
    }
  },
  'series-a': {
    label: 'Series A',
    description: 'Enhance security practices and release management',
    focus: ['security', 'release'],
    questionFilter: (q) => true // Include all questions
  },
  'series-b': {
    label: 'Series B+',
    description: 'Optimize workflows and implement advanced governance',
    focus: ['governance', 'optimization'],
    questionFilter: (q) => true // Include all questions with advanced options
  }
};

export const WAF_PILLARS = [
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

export const stages = [
  {
    id: "pre-seed",
    label: "Pre-Seed Startup",
    description: "Just starting out with a small team",
    benchmarks: {
      deploymentFreq: "2/week",
      securityLevel: 1,
      costEfficiency: 0.8,
      expectedScores: {
        'github-ecosystem': 2.0,
        'security': 1.5,
        'automation': 1.5
      }
    }
  },
  {
    id: "seed",
    label: "Seed Stage",
    description: "Raised seed funding, building MVP",
    benchmarks: {
      deploymentFreq: "1/day",
      securityLevel: 2,
      costEfficiency: 0.7,
      expectedScores: {
        'github-ecosystem': 2.5,
        'security': 2.5,
        'automation': 2.0
      }
    }
  },
  {
    id: "series-a",
    label: "Series A",
    description: "Scaling operations and team",
    benchmarks: {
      deploymentFreq: "multiple/day",
      securityLevel: 3,
      costEfficiency: 0.6,
      expectedScores: {
        'github-ecosystem': 3.5,
        'security': 3.0,
        'automation': 3.0
      }
    }
  }
];