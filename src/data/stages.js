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