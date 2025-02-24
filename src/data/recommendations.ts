import { Recommendation, Stage } from '../types';

export const recommendations: Record<Stage, Recommendation[]> = {
  'pre-seed': [
    {
      id: 'bp-1',
      title: 'Enable Branch Protection',
      description: 'Set up branch protection rules for your main branch',
      effort: 'Low',
      impact: 1,
      category: 'security',
      stage: 'pre-seed'
    },
    {
      id: 'ci-1',
      title: 'Implement Basic CI',
      description: 'Set up basic continuous integration with GitHub Actions',
      effort: 'Medium',
      impact: 0.8,
      category: 'automation',
      stage: 'pre-seed'
    }
  ],
  'seed': [
    {
      id: 'sec-1',
      title: 'Enable Code Scanning',
      description: 'Set up code scanning with CodeQL',
      effort: 'Low',
      impact: 0.9,
      category: 'security',
      stage: 'seed'
    },
    {
      id: 'auto-1',
      title: 'Automate Dependency Updates',
      description: 'Configure Dependabot for automated dependency management',
      effort: 'Low',
      impact: 0.7,
      category: 'automation',
      stage: 'seed'
    }
  ],
  'series-a': [
    {
      id: 'gov-1',
      title: 'Implement CODEOWNERS',
      description: 'Set up CODEOWNERS file for automated code review assignments',
      effort: 'High',
      impact: 0.9,
      category: 'governance',
      stage: 'series-a'
    },
    {
      id: 'sec-2',
      title: 'Advanced Security Features',
      description: 'Enable secret scanning and dependency review',
      effort: 'Medium',
      impact: 0.8,
      category: 'security',
      stage: 'series-a'
    }
  ],
  'series-b': [
    {
      id: 'ent-1',
      title: 'Enterprise Security Controls',
      description: 'Implement enterprise-grade security policies',
      effort: 'High',
      impact: 1,
      category: 'security',
      stage: 'series-b'
    },
    {
      id: 'auto-2',
      title: 'Full CI/CD Automation',
      description: 'Implement comprehensive CI/CD pipelines',
      effort: 'High',
      impact: 0.9,
      category: 'automation',
      stage: 'series-b'
    }
  ]
};