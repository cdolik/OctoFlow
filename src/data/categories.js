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
  'GitHub Codespaces': 'Cloud-powered development environments',
  'GitHub Discussions': 'Collaborative space for team communication',
  'Pull Request Templates': 'Standardized templates for code changes',
  'GitHub CLI': 'Command-line tool for GitHub workflows',
  'GitHub Team Sync': 'Sync team membership with identity providers'
};

export const categories = {
  'github-ecosystem': {
    id: 'github-ecosystem',
    title: 'GitHub Enterprise Adoption & Collaboration',
    description: 'Core GitHub features and collaboration practices',
    weight: 0.35,
    questions: [
      {
        id: 'codeowners',
        text: 'Do you enforce CODEOWNERS for critical directories?',
        tooltipTerm: 'CODEOWNERS',
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
        text: 'Are main branches protected from direct pushes?',
        tooltipTerm: 'branch protection',
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
        text: 'Do you use GitHub Projects for sprint planning?',
        tooltipTerm: 'GitHub Projects',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'Not using Projects' },
          { value: 2, text: 'Basic usage' },
          { value: 3, text: 'Integrated with issues/PRs' },
          { value: 4, text: 'Fully embedded in workflow' }
        ]
      }
    ]
  },
  'security': {
    id: 'security',
    title: 'Advanced Security & Compliance',
    description: 'Security features and vulnerability management',
    weight: 0.4,
    questions: [
      {
        id: 'secret-scanning',
        text: 'Are you alerted to exposed API keys and secrets?',
        tooltipTerm: 'secret scanning',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'Not using secret scanning' },
          { value: 2, text: 'Basic alerts enabled' },
          { value: 3, text: 'Alerts with manual review' },
          { value: 4, text: 'Automated secret revocation' }
        ]
      },
      {
        id: 'dependabot',
        text: 'Do you monitor dependencies using Dependabot?',
        tooltipTerm: 'Dependabot',
        stages: ['pre-seed', 'seed', 'series-a'],
        options: [
          { value: 1, text: 'Not enabled' },
          { value: 2, text: 'Security updates only' },
          { value: 3, text: 'Version updates enabled' },
          { value: 4, text: 'Fully automated with auto-merge' }
        ]
      },
      {
        id: 'code-scanning',
        text: 'Do you use code scanning for security vulnerabilities?',
        tooltipTerm: 'GitHub Advanced Security',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'No code scanning' },
          { value: 2, text: 'Basic CodeQL setup' },
          { value: 3, text: 'Custom scanning rules' },
          { value: 4, text: 'Advanced security automation' }
        ]
      },
      {
        id: 'compliance-checks',
        text: 'Do you have automated compliance checks?',
        tooltipTerm: 'GitHub Actions',
        stages: ['series-a'],
        options: [
          { value: 1, text: 'Manual compliance' },
          { value: 2, text: 'Basic automated checks' },
          { value: 3, text: 'Integrated compliance tests' },
          { value: 4, text: 'Full compliance automation' }
        ]
      }
    ]
  },
  'team-growth': {
    id: 'team-growth',
    title: 'Team Scaling & Onboarding',
    description: 'Developer onboarding and team collaboration',
    weight: 0.35,
    questions: [
      {
        id: 'dev-onboarding',
        text: 'How streamlined is your developer onboarding?',
        tooltipTerm: 'GitHub Codespaces',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'Manual setup process' },
          { value: 2, text: 'Basic documentation' },
          { value: 3, text: 'Automated environment setup' },
          { value: 4, text: 'Codespaces with custom config' }
        ]
      },
      {
        id: 'team-collaboration',
        text: 'How do you manage team discussions and knowledge sharing?',
        tooltipTerm: 'GitHub Discussions',
        stages: ['pre-seed', 'seed', 'series-a'],
        options: [
          { value: 1, text: 'Ad-hoc communication' },
          { value: 2, text: 'Basic issue discussions' },
          { value: 3, text: 'Structured discussions' },
          { value: 4, text: 'Full knowledge management' }
        ]
      },
      {
        id: 'team-permissions',
        text: 'How do you manage team access and permissions?',
        tooltipTerm: 'GitHub Team Sync',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'Manual permission management' },
          { value: 2, text: 'Basic team structure' },
          { value: 3, text: 'Role-based access' },
          { value: 4, text: 'Automated team sync' }
        ]
      }
    ]
  },
  'developer-experience': {
    id: 'developer-experience',
    title: 'Developer Experience & Productivity',
    description: 'Tools and practices for developer productivity',
    weight: 0.3,
    questions: [
      {
        id: 'cli-automation',
        text: 'Do developers use GitHub CLI for workflow automation?',
        tooltipTerm: 'GitHub CLI',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'No CLI usage' },
          { value: 2, text: 'Basic commands' },
          { value: 3, text: 'Custom aliases' },
          { value: 4, text: 'Advanced automation' }
        ]
      },
      {
        id: 'pr-templates',
        text: 'How structured are your pull request templates?',
        tooltipTerm: 'Pull Request Templates',
        stages: ['pre-seed', 'seed', 'series-a'],
        options: [
          { value: 1, text: 'No templates' },
          { value: 2, text: 'Basic template' },
          { value: 3, text: 'Custom checklists' },
          { value: 4, text: 'Advanced validation' }
        ]
      }
    ]
  },
  'ai-adoption': {
    id: 'ai-adoption',
    title: 'Copilot & AI Adoption',
    description: 'Usage of AI tools like GitHub Copilot',
    weight: 0.3,
    questions: [
      {
        id: 'copilot-usage',
        text: 'Do developers use GitHub Copilot?',
        tooltipTerm: 'GitHub Copilot',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'No AI assistance' },
          { value: 2, text: 'Minimal use' },
          { value: 3, text: 'Regular usage' },
          { value: 4, text: 'Fully integrated in workflow' }
        ]
      },
      {
        id: 'copilot-testing',
        text: 'Do you use AI for test generation?',
        tooltipTerm: 'Copilot for testing',
        stages: ['series-a'],
        options: [
          { value: 1, text: 'No AI for testing' },
          { value: 2, text: 'Basic test suggestions' },
          { value: 3, text: 'Regular test generation' },
          { value: 4, text: 'Advanced test automation' }
        ]
      }
    ]
  },
  'automation': {
    id: 'automation',
    title: 'CI/CD & Automation',
    description: 'Automation in deployments and workflows',
    weight: 0.3,
    questions: [
      {
        id: 'deployment-automation',
        text: 'How automated is your deployment process?',
        stages: ['pre-seed', 'seed', 'series-a'],
        options: [
          { value: 1, text: 'Manual deployments' },
          { value: 2, text: 'Basic CI pipeline' },
          { value: 3, text: 'Automated staging' },
          { value: 4, text: 'Full CI/CD automation' }
        ]
      },
      {
        id: 'pr-automation',
        text: 'Are PRs automatically assigned to reviewers?',
        tooltipTerm: 'auto assign',
        stages: ['seed', 'series-a'],
        options: [
          { value: 1, text: 'No auto-assignment' },
          { value: 2, text: 'Basic assignment rules' },
          { value: 3, text: 'CODEOWNERS integration' },
          { value: 4, text: 'Full workflow automation' }
        ]
      }
    ]
  }
};

export const getStageQuestions = (stage) => {
  return Object.values(categories).reduce((acc, category) => {
    const stageQuestions = category.questions.filter(q => q.stages.includes(stage));
    if (stageQuestions.length > 0) {
      acc.push({
        ...category,
        questions: stageQuestions
      });
    }
    return acc;
  }, []);
};

export const getCategoryWeight = (categoryId) => {
  return categories[categoryId]?.weight || 0;
};

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
        'ai-adoption': 1.0,
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
        'ai-adoption': 2.0,
        'automation': 2.5
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
        'ai-adoption': 2.5,
        'automation': 3.0
      }
    }
  }
];