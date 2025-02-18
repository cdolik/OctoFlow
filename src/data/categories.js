export const tooltips = {
  'GitFlow': 'A branching model that uses feature, develop, release, and master branches',
  'GitHub Flow': 'A simpler, trunk-based workflow built around GitHub features',
  'GitHub Actions': 'Automate your software workflows with CI/CD',
  'GitHub Advanced Security': 'Code scanning, secret scanning, and Dependabot',
  'GitHub Copilot': 'AI-powered code completion',
  'branch protection': 'Rules that enforce code review and CI checks',
  'code owners': 'Automatically request reviews from the right teams',
  'Dependabot': 'Automated dependency updates and security alerts',
  'issue templates': 'Standardized templates for bug reports and features',
};

export const stages = [
  {
    id: "pre-seed",
    label: "Pre-Seed Startup",
    description: "Just starting out with a small team",
    benchmarks: {
      deploymentFreq: "2/week",
      securityLevel: 1,
      costEfficiency: 0.8
    }
  },
  {
    id: "seed",
    label: "Seed Stage",
    description: "Raised seed funding, building MVP",
    benchmarks: {
      deploymentFreq: "1/day",
      securityLevel: 2,
      costEfficiency: 0.7
    }
  },
  {
    id: "series-a",
    label: "Series A",
    description: "Scaling operations and team",
    benchmarks: {
      deploymentFreq: "multiple/day",
      securityLevel: 3,
      costEfficiency: 0.6
    }
  }
];

export const categories = [
  {
    id: 'github-ecosystem',
    title: 'GitHub Usage & Ecosystem',
    description: 'Evaluate your team\'s GitHub adoption and best practices',
    weight: 0.3,
    questions: [
      {
        id: 'eco-1',
        text: 'Do you enforce',
        tooltipTerm: 'CODEOWNERS',
        textAfter: 'for critical directories?',
        options: [
          { value: 1, label: 'No CODEOWNERS file' },
          { value: 2, label: 'Basic CODEOWNERS setup' },
          { value: 3, label: 'CODEOWNERS with team assignments' },
          { value: 4, label: 'Full CODEOWNERS with automation' }
        ],
        minStage: 'seed'
      },
      {
        id: 'eco-2',
        text: 'How do you use',
        tooltipTerm: 'GitHub Actions',
        textAfter: 'for automation?',
        options: [
          { value: 1, label: 'Not using Actions' },
          { value: 2, label: 'Basic CI workflows' },
          { value: 3, label: 'CI/CD and custom workflows' },
          { value: 4, label: 'Advanced automation ecosystem' }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Assess your security practices and tools adoption',
    weight: 0.4,
    questions: [
      {
        id: 'sec-1',
        text: 'Do you enforce',
        tooltipTerm: 'branch protection',
        textAfter: 'rules on main branches?',
        options: [
          { value: 1, label: 'No protection rules' },
          { value: 2, label: 'Basic branch protection' },
          { value: 3, label: 'Required reviews and CI checks' },
          { value: 4, label: 'Full protection with status checks' }
        ]
      },
      {
        id: 'sec-2',
        text: 'How do you use',
        tooltipTerm: 'Dependabot',
        textAfter: 'for dependency management?',
        options: [
          { value: 1, label: 'Not enabled' },
          { value: 2, label: 'Security updates only' },
          { value: 3, label: 'Version updates enabled' },
          { value: 4, label: 'Custom configuration with auto-merge' }
        ],
        minStage: 'seed'
      }
    ]
  },
  {
    id: 'automation',
    title: 'CI/CD & Automation',
    description: 'Review your development workflow automation',
    weight: 0.3,
    questions: [
      {
        id: 'auto-1',
        text: 'How automated is your deployment process?',
        options: [
          { value: 1, label: 'Manual deployments' },
          { value: 2, label: 'Basic CI pipeline' },
          { value: 3, label: 'Automated staging deployments' },
          { value: 4, label: 'Full CI/CD with automated production deployments' }
        ]
      }
    ]
  }
];

export const stageConfiguration = {
  'pre-seed': {
    focusCategories: ['github-enterprise', 'automation'],
    questionFilter: (question) => !question.advancedOnly,
    benchmarks: {
      deploymentFrequency: '2-3 times per week',
      securityScore: 2.5,
      automationScore: 2.0
    }
  },
  'series-a': {
    focusCategories: ['advanced-security', 'automation'],
    questionFilter: () => true,
    benchmarks: {
      deploymentFrequency: '2-3 times per day',
      securityScore: 3.5,
      automationScore: 3.0
    }
  },
  'series-b': {
    focusCategories: ['advanced-security', 'copilot-ai'],
    questionFilter: () => true,
    benchmarks: {
      deploymentFrequency: '5+ times per day',
      securityScore: 3.8,
      automationScore: 3.5
    }
  }
};

export const getStageQuestions = (stage) => {
  const config = stageConfiguration[stage];
  if (!config) return categories;

  return categories.map(category => ({
    ...category,
    questions: category.questions.filter(config.questionFilter)
  }));
};