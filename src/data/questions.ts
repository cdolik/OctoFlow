import { Question, Category, Stage } from '../types/assessment';

export const categories: Record<string, Category> = {
  GITHUB_ENTERPRISE: {
    id: 'github-ecosystem',
    title: 'GitHub Enterprise Adoption & Collaboration',
    weight: 0.35,
    description: 'Core GitHub features and collaboration practices',
    focusAreas: ['Code Review', 'Team Management', 'Repository Settings']
  },
  SECURITY: {
    id: 'security',
    title: 'Advanced Security & Compliance',
    weight: 0.4,
    description: 'Security features and vulnerability management',
    focusAreas: ['Secret Scanning', 'Dependency Management', 'Static Analysis']
  },
  AI_ADOPTION: {
    id: 'ai-adoption',
    title: 'Copilot & AI Adoption',
    weight: 0.3,
    description: 'AI-powered development features',
    focusAreas: ['Code Generation', 'Test Automation', 'Documentation']
  },
  AUTOMATION: {
    id: 'automation',
    title: 'CI/CD & Automation',
    weight: 0.3,
    description: 'Continuous integration and deployment practices',
    focusAreas: ['Workflows', 'Deployments', 'Pull Request Automation']
  },
} as const;

export const questions: Question[] = [
  {
    id: 'codeowners',
    category: 'github-ecosystem',
    text: 'Do you enforce CODEOWNERS for critical directories?',
    tooltipTerm: 'CODEOWNERS',
    weight: 0.35,
    stages: ['pre-seed', 'seed', 'series-a'],
    options: [
      { value: 1, text: 'No CODEOWNERS file' },
      { value: 2, text: 'Basic CODEOWNERS setup' },
      { value: 3, text: 'CODEOWNERS with team assignments' },
      { value: 4, text: 'Full CODEOWNERS with automation' }
    ]
  },
  // ... existing questions ...
];

export const getStageQuestions = (stage: Stage): Question[] => {
  return questions.filter(q => q.stages.includes(stage));
};

export const getCategoryWeight = (categoryId: string): number => {
  const category = Object.values(categories).find(c => c.id === categoryId);
  return category?.weight ?? 0;
};