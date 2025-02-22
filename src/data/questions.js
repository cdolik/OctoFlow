import { Question } from '../types';

export const categories = {
  GITHUB_ENTERPRISE: {
    id: 'github-ecosystem',
    title: 'GitHub Enterprise Adoption & Collaboration',
    weight: 0.35,
    description: 'Core GitHub features and collaboration practices',
  },
  SECURITY: {
    id: 'security',
    title: 'Advanced Security & Compliance',
    weight: 0.4,
    description: 'Security features and vulnerability management',
  },
  AI_ADOPTION: {
    id: 'ai-adoption',
    title: 'Copilot & AI Adoption',
    weight: 0.3,
    description: 'AI-powered development features',
  },
  AUTOMATION: {
    id: 'automation',
    title: 'CI/CD & Automation',
    weight: 0.3,
    description: 'Continuous integration and deployment practices',
  },
};

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
    id: 'branch-protection',
    category: 'github-ecosystem',
    text: 'Are main branches protected from direct pushes?',
    tooltipTerm: 'branch protection',
    weight: 0.35,
    stages: ['pre-seed', 'seed', 'series-a'],
    options: [
      { value: 1, text: 'No protection rules' },
      { value: 2, text: 'Basic branch protection' },
      { value: 3, text: 'Required reviews enabled' },
      { value: 4, text: 'Full protection with status checks' }
    ]
  },
  {
    id: 'project-management',
    category: 'github-ecosystem',
    text: 'Do you use GitHub Projects for sprint planning and issue tracking?',
    tooltipTerm: 'GitHub Projects',
    weight: 0.3,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'Not using Projects' },
      { value: 2, text: 'Basic usage' },
      { value: 3, text: 'Integrated with issues/PRs' },
      { value: 4, text: 'Fully embedded in workflow planning' }
    ]
  },
  {
    id: 'secret-scanning',
    category: 'security',
    text: 'Are you alerted to exposed API keys and secrets?',
    tooltipTerm: 'secret scanning',
    weight: 0.4,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'Not using secret scanning' },
      { value: 2, text: 'Basic alerts enabled' },
      { value: 3, text: 'Alerts with manual review' },
      { value: 4, text: 'Automated secret revocation configured' }
    ]
  },
  {
    id: 'dependabot',
    category: 'security',
    text: 'Do you monitor for vulnerable dependencies using Dependabot?',
    tooltipTerm: 'Dependabot',
    weight: 0.4,
    stages: ['pre-seed', 'seed', 'series-a'],
    options: [
      { value: 1, text: 'Not enabled' },
      { value: 2, text: 'Security updates only' },
      { value: 3, text: 'Version updates enabled' },
      { value: 4, text: 'Fully automated with custom config and auto-merge' }
    ]
  },
  {
    id: 'code-scanning',
    category: 'security',
    text: 'Do you run static analysis (CodeQL) in your CI pipeline?',
    tooltipTerm: 'CodeQL',
    weight: 0.4,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'Not running code scanning' },
      { value: 2, text: 'Basic scanning occasionally' },
      { value: 3, text: 'Integrated scanning with manual review' },
      { value: 4, text: 'Fully automated code scanning on every build' }
    ]
  },
  {
    id: 'copilot-usage',
    category: 'ai-adoption',
    text: 'Do developers use AI tools (like GitHub Copilot) for generating boilerplate code?',
    tooltipTerm: 'GitHub Copilot',
    weight: 0.3,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'No AI assistance' },
      { value: 2, text: 'Minimal use' },
      { value: 3, text: 'Moderate usage' },
      { value: 4, text: 'Extensive use for repetitive tasks' }
    ]
  },
  {
    id: 'ai-testing',
    category: 'ai-adoption',
    text: 'Are unit tests generated or suggested by AI tools?',
    tooltipTerm: 'Copilot for testing',
    weight: 0.3,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'No AI support for tests' },
      { value: 2, text: 'Basic manual tests only' },
      { value: 3, text: 'Some AI suggestions used' },
      { value: 4, text: 'AI significantly assists in test creation' }
    ]
  },
  {
    id: 'deployment-automation',
    category: 'automation',
    text: 'How automated is your deployment process?',
    tooltipTerm: null,
    weight: 0.3,
    stages: ['pre-seed', 'seed', 'series-a'],
    options: [
      { value: 1, text: 'Manual deployments' },
      { value: 2, text: 'Basic CI pipeline' },
      { value: 3, text: 'Automated staging deployments' },
      { value: 4, text: 'Full CI/CD with automated production deployments' }
    ]
  },
  {
    id: 'pr-automation',
    category: 'automation',
    text: 'Are pull requests automatically assigned to appropriate reviewers?',
    tooltipTerm: 'auto assign',
    weight: 0.3,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'No auto-assignment' },
      { value: 2, text: 'Basic assignment with manual overrides' },
      { value: 3, text: 'Mostly automated with some manual intervention' },
      { value: 4, text: 'Fully automated using CODEOWNERS and auto-assign actions' }
    ]
  },
  {
    id: 'branch-strategy',
    text: 'What is your branching strategy?',
    options: [
      { value: 1, text: 'No defined strategy' },
      { value: 2, text: 'Basic strategy (e.g., feature branches)' },
      { value: 3, text: 'Advanced strategy (e.g., GitFlow)' },
      { value: 4, text: 'Custom strategy with automation' }
    ]
  },
  {
    id: 'pr-review',
    text: 'How do you handle pull request reviews?',
    options: [
      { value: 1, text: 'No formal review process' },
      { value: 2, text: 'Basic review process (e.g., one reviewer)' },
      { value: 3, text: 'Advanced review process (e.g., multiple reviewers)' },
      { value: 4, text: 'Automated review process with CI integration' }
    ]
  },
  {
    id: 'ci-practices',
    text: 'What are your CI practices?',
    options: [
      { value: 1, text: 'No CI practices' },
      { value: 2, text: 'Basic CI practices (e.g., linting, testing)' },
      { value: 3, text: 'Advanced CI practices (e.g., automated builds, deployments)' },
      { value: 4, text: 'Custom CI practices with full automation' }
    ]
  }
];

export const getStageQuestions = (stage: string): Question[] => {
  return questions.filter(q => q.stages.includes(stage));
};

export const getCategoryWeight = (categoryId: string): number => {
  const category = Object.values(categories).find(c => c.id === categoryId);
  return category ? category.weight : 0;
};
