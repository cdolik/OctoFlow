export const tooltips = {
  'GitFlow': 'A branching model that uses feature, develop, release, and master branches',
  'GitHub Flow': 'A simpler, trunk-based workflow built around GitHub features',
  'GitHub Actions': 'Automate your software workflows with CI/CD and custom automations',
  'GitHub Advanced Security': 'Advanced security features including code scanning and secret detection',
  'GitHub Copilot': 'AI pair programmer that helps you write code faster',
  'branch protection': 'Rules that enforce code review and CI checks before merging',
  'code owners': 'Automatically request reviews from the right teams',
  'Dependabot': 'Automated dependency updates and security alerts',
  'issue templates': 'Standardized templates for bug reports and feature requests',
  'GitHub Actions Marketplace': 'Pre-built workflows and integrations'
};

export const categories = [
  {
    id: 'github-adoption',
    title: 'GitHub Ecosystem',
    questions: [
      {
        id: 'workflow-automation',
        text: 'How do you automate your development workflows with GitHub Actions?',
        options: [
          { 
            value: 1, 
            text: 'No automation currently',
            recommendation: {
              type: 'github-action',
              text: "Get Started with GitHub Actions →",
              link: "https://docs.github.com/en/actions/quickstart"
            }
          },
          { 
            value: 2, 
            text: 'Basic CI/CD workflows',
            recommendation: {
              type: 'github-action',
              text: "Explore Starter Workflows →",
              link: "https://github.com/actions/starter-workflows"
            }
          },
          { 
            value: 3, 
            text: 'Custom workflows with GitHub Actions',
            recommendation: {
              type: 'marketplace',
              text: "Discover Actions Marketplace →",
              link: "https://github.com/marketplace?type=actions"
            }
          },
          { 
            value: 4, 
            text: 'Advanced automation with custom actions and marketplace integrations',
            recommendation: {
              type: 'best-practice',
              text: "Learn Advanced GitHub Actions →",
              link: "https://docs.github.com/en/actions/creating-actions"
            }
          }
        ]
      },
      {
        id: 'security-features',
        text: 'Which GitHub Advanced Security features do you use?',
        options: [
          {
            value: 1,
            text: 'Not using security features',
            recommendation: {
              type: 'security',
              text: "Enable Basic Security Features →",
              link: "https://docs.github.com/en/code-security/getting-started"
            }
          },
          {
            value: 2,
            text: 'Dependabot alerts only',
            recommendation: {
              type: 'security',
              text: "Configure Dependabot Security Updates →",
              link: "https://docs.github.com/en/code-security/dependabot"
            }
          },
          {
            value: 3,
            text: 'Code scanning and secret scanning',
            recommendation: {
              type: 'security',
              text: "Optimize CodeQL Scanning →",
              link: "https://docs.github.com/en/code-security/code-scanning"
            }
          },
          {
            value: 4,
            text: 'Full GitHub Advanced Security suite with custom policies',
            recommendation: {
              type: 'security',
              text: "Explore Security Best Practices →",
              link: "https://docs.github.com/en/enterprise-cloud@latest/code-security"
            }
          }
        ]
      }
    ]
  },
  {
    id: 'workflow',
    title: 'Development Workflow',
    questions: [
      {
        id: 'branch-strategy',
        text: 'How do you manage your branching strategy with GitHub?',
        options: [
          {
            value: 1,
            text: 'Direct commits to main branch',
            recommendation: {
              type: 'workflow',
              text: "Learn GitHub Flow →",
              link: "https://guides.github.com/introduction/flow/"
            }
          },
          {
            value: 2,
            text: 'Feature branches without protection',
            recommendation: {
              type: 'workflow',
              text: "Set Up Branch Protection →",
              link: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests"
            }
          },
          {
            value: 3,
            text: 'GitHub Flow with basic branch protection',
            recommendation: {
              type: 'workflow',
              text: "Enhance PR Reviews →",
              link: "https://docs.github.com/en/github/collaborating-with-pull-requests"
            }
          },
          {
            value: 4,
            text: 'GitHub Flow with required reviews and status checks',
            recommendation: {
              type: 'workflow',
              text: "Implement Advanced Policies →",
              link: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches"
            }
          }
        ]
      },
      {
        id: 'code-review',
        text: 'What is your pull request review process?',
        options: [
          {
            value: 1,
            text: 'No formal review process',
            recommendation: {
              type: 'workflow',
              text: "Start with PR Reviews →",
              link: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests"
            }
          },
          {
            value: 2,
            text: 'Optional peer reviews',
            recommendation: {
              type: 'workflow',
              text: "Configure Required Reviews →",
              link: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/about-protected-branches#about-branch-protection-settings"
            }
          },
          {
            value: 3,
            text: 'Required reviews with code owners',
            recommendation: {
              type: 'workflow',
              text: "Optimize Code Owners →",
              link: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners"
            }
          },
          {
            value: 4,
            text: 'Required reviews, code owners, and automated checks',
            recommendation: {
              type: 'workflow',
              text: "Advanced PR Automation →",
              link: "https://docs.github.com/en/actions/managing-workflow-runs"
            }
          }
        ]
      }
    ]
  },
  {
    id: 'automation',
    title: 'CI/CD & Automation',
    questions: [
      {
        id: 'ci-practices',
        text: 'How comprehensive is your GitHub Actions CI pipeline?',
        options: [
          {
            value: 1,
            text: 'No CI automation',
            recommendation: {
              type: 'automation',
              text: "Set Up Basic CI →",
              link: "https://docs.github.com/en/actions/automating-builds-and-tests"
            }
          },
          {
            value: 2,
            text: 'Basic build and test workflows',
            recommendation: {
              type: 'automation',
              text: "Add Code Quality Checks →",
              link: "https://docs.github.com/en/github/finding-security-vulnerabilities-and-errors-in-your-code"
            }
          },
          {
            value: 3,
            text: 'Full CI pipeline with quality gates',
            recommendation: {
              type: 'automation',
              text: "Implement Matrix Testing →",
              link: "https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs"
            }
          },
          {
            value: 4,
            text: 'Advanced CI with custom actions and caching',
            recommendation: {
              type: 'automation',
              text: "Optimize CI Performance →",
              link: "https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows"
            }
          }
        ]
      }
    ]
  }
];