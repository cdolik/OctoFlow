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
  {
    id: 'branch-strategy',
    category: 'github-ecosystem',
    text: 'What is your branch strategy?',
    weight: 0.3,
    stages: ['pre-seed', 'seed', 'series-a', 'series-b'],
    options: [
      { value: 1, text: 'No defined strategy' },
      { value: 2, text: 'Basic strategy (e.g., main and feature branches)' },
      { value: 3, text: 'Advanced strategy (e.g., GitFlow)' },
      { value: 4, text: 'Fully automated strategy with CI/CD' }
    ]
  },
  {
    id: 'pr-review',
    category: 'github-ecosystem',
    text: 'How do you handle pull request reviews?',
    weight: 0.25,
    stages: ['pre-seed', 'seed', 'series-a', 'series-b'],
    options: [
      { value: 1, text: 'No formal review process' },
      { value: 2, text: 'Basic review process' },
      { value: 3, text: 'Standardized review process with guidelines' },
      { value: 4, text: 'Automated review process with CI/CD integration' }
    ]
  },
  {
    id: 'ci-practices',
    category: 'automation',
    text: 'What are your CI practices?',
    weight: 0.4,
    stages: ['pre-seed', 'seed', 'series-a', 'series-b'],
    options: [
      { value: 1, text: 'No CI practices' },
      { value: 2, text: 'Basic CI practices' },
      { value: 3, text: 'Standardized CI practices' },
      { value: 4, text: 'Advanced CI practices with full automation' }
    ]
  },
  {
    id: 'dependabot',
    category: 'security',
    text: 'How do you manage dependency vulnerabilities?',
    weight: 0.4,
    stages: ['pre-seed', 'seed', 'series-a', 'series-b'],
    options: [
      { value: 1, text: 'No automated vulnerability checking' },
      { value: 2, text: 'Manual periodic checks' },
      { value: 3, text: 'Dependabot alerts enabled' },
      { value: 4, text: 'Dependabot with auto-PRs and CI integration' }
    ]
  },
  {
    id: 'branch-protection',
    category: 'security',
    text: 'How are your branches protected?',
    weight: 0.35,
    stages: ['pre-seed', 'seed', 'series-a', 'series-b'],
    options: [
      { value: 1, text: 'No branch protection' },
      { value: 2, text: 'Basic branch protection rules' },
      { value: 3, text: 'Required reviews and status checks' },
      { value: 4, text: 'Advanced protection with required signatures' }
    ]
  },
  {
    id: 'ai-adoption',
    category: 'ai-adoption',
    text: 'How extensively do you use GitHub Copilot?',
    weight: 0.3,
    stages: ['seed', 'series-a', 'series-b'],
    options: [
      { value: 1, text: 'Not using' },
      { value: 2, text: 'Limited use' },
      { value: 3, text: 'Regular use' },
      { value: 4, text: 'Team-wide adoption' }
    ]
  }
];

export const getStageQuestions = (stage: Stage): Question[] => {
  return questions.filter(q => q.stages.includes(stage));
};

export const getCategoryWeight = (categoryId: string): number => {
  const category = Object.values(categories).find(c => c.id === categoryId);
  return category?.weight ?? 0;
};
