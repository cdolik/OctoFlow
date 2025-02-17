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
    id: 'github-enterprise',
    title: 'GitHub Enterprise & Collaboration',
    description: 'Assess the adoption of collaboration practices that are essential for modern software development on GitHub.',
    weight: 0.3,
    questions: [
      {
        id: 'collab-1',
        text: 'Do you enforce',
        tooltipTerm: 'CODEOWNERS',
        textAfter: 'for critical directories?',
        options: [
          { value: 1, label: 'No CODEOWNERS file' },
          { value: 2, label: 'Basic CODEOWNERS setup' },
          { value: 3, label: 'CODEOWNERS with team assignments' },
          { value: 4, label: 'Full CODEOWNERS with automation' }
        ],
        recommendation: {
          text: 'Enable CODEOWNERS to automatically request reviews from the right teams',
          link: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners'
        }
      },
      {
        id: 'collab-2',
        text: 'Are main branches protected from direct pushes?',
        tooltipTerm: 'branch protection',
        options: [
          { value: 1, label: 'No protection rules' },
          { value: 2, label: 'Basic protection (simple rules)' },
          { value: 3, label: 'Required reviews enforced' },
          { value: 4, label: 'Full protection with status checks' }
        ],
        recommendation: {
          text: 'Set up branch protection rules to enforce code review and CI checks',
          link: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches'
        }
      },
      {
        id: 'collab-3',
        text: 'Do you use GitHub Projects for sprint planning and task tracking?',
        tooltipTerm: 'GitHub Projects',
        options: [
          { value: 1, label: 'Not using projects' },
          { value: 2, label: 'Basic usage' },
          { value: 3, label: 'Integrated with Issues/PRs' },
          { value: 4, label: 'Fully automated workflow with project boards' }
        ],
        recommendation: {
          text: 'Utilize GitHub Projects for automated project management',
          link: 'https://docs.github.com/en/issues/planning-and-tracking-with-projects'
        }
      }
    ]
  },
  {
    id: 'advanced-security',
    title: 'Advanced Security',
    description: 'Measure how well the team uses GitHub security features to prevent vulnerabilities and manage risks.',
    weight: 0.4,
    questions: [
      {
        id: 'sec-1',
        text: 'Are you alerted to exposed API keys/secrets?',
        tooltipTerm: 'secret scanning',
        options: [
          { value: 1, label: 'Not enabled' },
          { value: 2, label: 'Basic alerts only' },
          { value: 3, label: 'Alerts with manual response' },
          { value: 4, label: 'Automated revocation and response' }
        ],
        recommendation: {
          text: 'Enable secret scanning to automatically detect exposed secrets',
          link: 'https://docs.github.com/en/code-security/secret-scanning'
        }
      },
      {
        id: 'sec-2',
        text: 'Do you monitor for vulnerable dependencies?',
        tooltipTerm: 'Dependabot',
        options: [
          { value: 1, label: 'Not enabled' },
          { value: 2, label: 'Security updates only' },
          { value: 3, label: 'Version updates enabled' },
          { value: 4, label: 'Custom configuration with auto-merge' }
        ],
        recommendation: {
          text: 'Configure Dependabot for automated dependency updates',
          link: 'https://docs.github.com/en/code-security/dependabot'
        }
      },
      {
        id: 'sec-3',
        text: 'Do you run static analysis (CodeQL) for security flaws?',
        tooltipTerm: 'CodeQL',
        options: [
          { value: 1, label: 'Not implemented' },
          { value: 2, label: 'Occasional manual scans' },
          { value: 3, label: 'Integrated into CI/CD' },
          { value: 4, label: 'Fully automated, with continuous monitoring' }
        ],
        recommendation: {
          text: 'Implement CodeQL analysis in your CI/CD pipeline',
          link: 'https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning'
        }
      }
    ]
  },
  {
    id: 'copilot-ai',
    title: 'GitHub Copilot & AI Adoption',
    description: 'Evaluate how much the team leverages AI tools like GitHub Copilot to improve productivity.',
    weight: 0.2,
    questions: [
      {
        id: 'ai-1',
        text: 'Do developers use AI (e.g., GitHub Copilot) for generating boilerplate code?',
        tooltipTerm: 'GitHub Copilot',
        options: [
          { value: 1, label: 'Not used' },
          { value: 2, label: 'Occasionally used' },
          { value: 3, label: 'Used for repetitive tasks' },
          { value: 4, label: 'Utilized for 80%+ of boilerplate code' }
        ],
        recommendation: {
          text: 'Start using GitHub Copilot to boost developer productivity',
          link: 'https://github.com/features/copilot'
        }
      },
      {
        id: 'ai-2',
        text: 'Are unit tests generated with the help of AI tools?',
        tooltipTerm: 'Copilot for testing',
        options: [
          { value: 1, label: 'Not used' },
          { value: 2, label: 'Rarely used' },
          { value: 3, label: 'Frequently used' },
          { value: 4, label: 'Consistently integrated in CI/CD' }
        ],
        recommendation: {
          text: 'Use GitHub Copilot to generate and maintain test coverage',
          link: 'https://github.blog/2023-12-06-github-copilot-chat-beta-now-available-for-individuals/'
        }
      }
    ]
  },
  {
    id: 'automation',
    title: 'Automation & Actions',
    description: 'Assess the maturity of the CI/CD pipeline and workflow automation.',
    weight: 0.3,
    questions: [
      {
        id: 'auto-1',
        text: 'Are deployments fully automated via GitHub Actions?',
        tooltipTerm: 'GitHub Actions',
        options: [
          { value: 1, label: 'Manual deployments' },
          { value: 2, label: 'Basic CI pipeline' },
          { value: 3, label: 'Automated staging deployments' },
          { value: 4, label: 'Full CI/CD with production automation' }
        ],
        recommendation: {
          text: 'Implement GitHub Actions for automated deployments',
          link: 'https://github.com/actions/starter-workflows'
        }
      },
      {
        id: 'auto-2',
        text: 'Are pull requests automatically assigned to reviewers?',
        tooltipTerm: 'auto assign',
        options: [
          { value: 1, label: 'Not automated' },
          { value: 2, label: 'Basic manual assignment' },
          { value: 3, label: 'CODEOWNERS in place' },
          { value: 4, label: 'Fully automated assignment using GitHub Actions' }
        ],
        recommendation: {
          text: 'Set up automatic PR assignment with GitHub Actions',
          link: 'https://github.com/marketplace/actions/auto-assign-action'
        }
      },
      {
        id: 'auto-3',
        text: 'Do you provision cloud resources via GitHub workflows?',
        tooltipTerm: 'IaC',
        options: [
          { value: 1, label: 'Not used' },
          { value: 2, label: 'Basic scripting' },
          { value: 3, label: 'Terraform/CDK partially integrated' },
          { value: 4, label: 'Full IaC with automated deployments' }
        ],
        recommendation: {
          text: 'Implement Infrastructure as Code with GitHub Actions',
          link: 'https://docs.github.com/en/actions/deployment'
        }
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