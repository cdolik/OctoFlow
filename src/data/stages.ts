import { Stage, StageDefinition, Question } from '../types';

export const stages: StageDefinition[] = [
  {
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
  {
    id: 'seed',
    label: 'Seed Stage',
    description: 'Raised seed funding, building MVP',
    focus: ['security', 'release'],
    benchmarks: {
      deploymentFreq: '1/day',
      securityLevel: 2,
      costEfficiency: 0.7,
      expectedScores: {
        'github-ecosystem': 3.0,
        'security': 2.5,
        'automation': 2.5
      }
    },
    questionFilter: (q: Question) => true
  },
  {
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
  {
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
];

// Helper functions
export const getStage = (stageId: Stage): StageDefinition | undefined => 
  stages.find(s => s.id === stageId);

export const getStageQuestions = (stage: Stage, questions: Question[]): Question[] =>
  questions.filter(q => stages.find(s => s.id === stage)?.questionFilter(q));

export const validateStageSequence = (fromStage: Stage | null, toStage: Stage): boolean => {
  if (!fromStage) return true;
  
  const stageOrder = stages.map(s => s.id);
  const fromIndex = stageOrder.indexOf(fromStage);
  const toIndex = stageOrder.indexOf(toStage);
  
  return toIndex <= fromIndex + 1;
};

export const getNextStage = (currentStage: Stage): Stage | null => {
  const stageOrder = stages.map(s => s.id);
  const currentIdx = stageOrder.indexOf(currentStage);
  return currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;
};

export const getPreviousStage = (currentStage: Stage): Stage | null => {
  const stageOrder = stages.map(s => s.id);
  const currentIdx = stageOrder.indexOf(currentStage);
  return currentIdx > 0 ? stageOrder[currentIdx - 1] : null;
};

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
