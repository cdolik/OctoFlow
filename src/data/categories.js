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
    id: "deployment",
    label: "Deployment Pipeline",
    description: "Assess your deployment frequency and automation",
    weight: 0.3
  },
  {
    id: "security",
    label: "Security & Compliance",
    description: "Evaluate your security practices and risk management",
    weight: 0.4
  },
  {
    id: "cost",
    label: "Cost Optimization",
    description: "Review infrastructure and operational costs",
    weight: 0.3
  }
];

export const categories = [
  {
    id: 'github-ecosystem',
    title: 'GitHub Usage',
    icon: '🐙',
    questions: [
      {
        id: 'actions-usage',
        text: 'How do you use GitHub Actions?',
        options: [
          {
            value: 1,
            text: 'No automation currently',
            recommendation: {
              type: 'github',
              text: 'Start with CI Starter Workflow →',
              link: 'https://github.com/actions/starter-workflows'
            }
          },
          {
            value: 2,
            text: 'Basic CI/CD workflows',
            recommendation: {
              type: 'github',
              text: 'Add matrix testing →',
              link: 'https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs'
            }
          },
          {
            value: 3,
            text: 'Multiple workflow optimizations',
            recommendation: {
              type: 'github',
              text: 'Implement caching →',
              link: 'https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows'
            }
          },
          {
            value: 4,
            text: 'Custom actions and marketplace integrations',
            recommendation: {
              type: 'marketplace',
              text: 'Explore Actions Marketplace →',
              link: 'https://github.com/marketplace?type=actions'
            }
          }
        ]
      },
      {
        id: 'security-features',
        text: 'Which GitHub security features do you use?',
        options: [
          {
            value: 1,
            text: 'Basic repository settings only',
            recommendation: {
              type: 'github',
              text: 'Enable Dependabot alerts →',
              link: 'https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts'
            }
          },
          {
            value: 2,
            text: 'Dependabot alerts enabled',
            recommendation: {
              type: 'github',
              text: 'Set up code scanning →',
              link: 'https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning'
            }
          },
          {
            value: 3,
            text: 'Code scanning and secret scanning',
            recommendation: {
              type: 'github',
              text: 'Configure dependency review →',
              link: 'https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review'
            }
          },
          {
            value: 4,
            text: 'Full Advanced Security suite',
            recommendation: {
              type: 'best-practice',
              text: 'Review security best practices →',
              link: 'https://docs.github.com/en/code-security/getting-started/security-guides'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    icon: '👥',
    questions: [
      {
        id: 'workflow-practice',
        text: 'How does your team collaborate on code?',
        options: [
          {
            value: 1,
            text: 'Direct commits to main branch',
            recommendation: {
              type: 'github',
              text: "Set up branch protection →",
              link: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-a-branch-protection-rule"
            }
          },
          {
            value: 2,
            text: 'Feature branches with manual reviews',
            recommendation: {
              type: 'github',
              text: "Enable required reviews →",
              link: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/about-protected-branches#require-pull-request-reviews-before-merging"
            }
          },
          {
            value: 3,
            text: 'Protected branches with required reviews',
            recommendation: {
              type: 'github',
              text: "Add CODEOWNERS file →",
              link: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners"
            }
          },
          {
            value: 4,
            text: 'Full GitHub Flow with code owners',
            recommendation: {
              type: 'best-practice',
              text: "Optimize your workflow →",
              link: "https://docs.github.com/en/get-started/quickstart/github-flow"
            }
          }
        ]
      },
      {
        id: 'code-reviews',
        text: 'How are pull requests managed?',
        options: [
          { 
            value: 1, 
            text: 'No formal process',
            recommendation: {
              type: 'github',
              text: "Enable required reviews with branch protection →",
              link: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-a-branch-protection-rule"
            }
          },
          {
            value: 4,
            text: 'Enforced reviews + CODEOWNERS',
            recommendation: {
              type: 'upsell',
              text: "Optimize with GitHub Advanced Security →",
              link: "https://github.com/startups/security"
            }
          }
        ]
      }
    ]
  },
  {
    id: 'automation',
    title: 'CI/CD & Automation',
    icon: '⚡',
    questions: [
      {
        id: 'ci-practice',
        text: 'How do you automate your development?',
        options: [
          {
            value: 1,
            text: 'Manual testing and deployment',
            recommendation: {
              type: 'github',
              text: "Start with GitHub Actions →",
              link: "https://docs.github.com/en/actions/quickstart"
            }
          },
          {
            value: 2,
            text: 'Basic GitHub Actions workflows',
            recommendation: {
              type: 'github',
              text: "Add automated tests →",
              link: "https://docs.github.com/en/actions/automating-builds-and-tests"
            }
          },
          {
            value: 3,
            text: 'CI/CD with automated tests',
            recommendation: {
              type: 'github',
              text: "Optimize with caching →",
              link: "https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows"
            }
          },
          {
            value: 4,
            text: 'Full CI/CD with optimizations',
            recommendation: {
              type: 'marketplace',
              text: "Explore Actions Marketplace →",
              link: "https://github.com/marketplace?type=actions"
            }
          }
        ]
      },
      {
        id: 'testing',
        text: 'How are tests executed?',
        options: [
          {
            value: 1,
            text: 'Manually by developers',
            recommendation: {
              type: 'github',
              text: "Automate with GitHub Actions →",
              link: "https://github.com/features/actions"
            }
          },
          {
            value: 2,
            text: 'Full CI/CD pipeline with Actions',
            recommendation: {
              type: 'partner',
              text: "Enhance with GitHub Marketplace tools →",
              link: "https://github.com/marketplace"
            }
          }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Security Essentials',
    icon: '🔒',
    questions: [
      {
        id: 'security-practice',
        text: 'How do you manage code security?',
        options: [
          {
            value: 1,
            text: 'Manual code review only',
            recommendation: {
              type: 'github',
              text: "Enable Dependabot alerts →",
              link: "https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts"
            }
          },
          {
            value: 2,
            text: 'Dependabot alerts enabled',
            recommendation: {
              type: 'github',
              text: "Set up secret scanning →",
              link: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning"
            }
          },
          {
            value: 3,
            text: 'Secret scanning and dependency updates',
            recommendation: {
              type: 'github',
              text: "Configure Dependabot updates →",
              link: "https://docs.github.com/en/code-security/dependabot/dependabot-version-updates"
            }
          },
          {
            value: 4,
            text: 'Full security features enabled',
            recommendation: {
              type: 'best-practice',
              text: "Review security best practices →",
              link: "https://docs.github.com/en/code-security/getting-started/security-guides"
            }
          }
        ]
      }
    ]
  }
];