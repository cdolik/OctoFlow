export const tooltips = {
  'GitFlow': 'A branching model that uses feature, develop, release, and master branches to manage code releases.',
  'trunk-based development': 'A source control pattern where developers merge small, frequent updates to a core "trunk" or main branch.',
  'pull requests': 'Proposed changes to a repository submitted by a user and accepted or rejected by collaborators.',
  'CI process': 'Continuous Integration - automatically building and testing code changes when pushed to a repository.',
  'CD pipeline': 'Continuous Deployment - automatically deploying code changes to production after passing tests.',
  'quality gates': 'Predetermined criteria that must be met before code can progress to the next stage.',
  'branch protection': 'Rules that enforce certain workflows, such as requiring reviews before merging.',
  'code owners': 'Automatically request reviews from the right teams when a pull request changes specific files.',
  'issue templates': 'Customizable templates for new issues to ensure consistent information gathering.',
  'GitHub Actions': 'Automated workflows that can be triggered by GitHub events like push, PR, or issue creation.',
  'semantic versioning': 'Version numbering format (MAJOR.MINOR.PATCH) based on the types of changes made.',
  'release automation': 'Automated processes for creating releases, changelogs, and deployment artifacts.'
};

export const categories = [
  {
    id: 'workflow',
    title: 'GitHub Workflow',
    questions: [
      {
        id: 'branch-strategy',
        text: 'How do you manage your branching strategy?',
        options: [
          { value: 1, text: 'No specific strategy' },
          { value: 2, text: 'Basic feature branches' },
          { value: 3, text: 'Feature branches with pull requests' },
          { value: 4, text: 'GitFlow or trunk-based development with branch protection' }
        ]
      },
      {
        id: 'pr-review',
        text: 'What is your pull request review process?',
        options: [
          { value: 1, text: 'No formal review process' },
          { value: 2, text: 'Basic code review by team members' },
          { value: 3, text: 'Required reviews with code owners' },
          { value: 4, text: 'Automated checks and required reviews with templates' }
        ]
      },
      {
        id: 'issue-management',
        text: 'How do you manage issues and track work?',
        options: [
          { value: 1, text: 'Ad-hoc issue creation' },
          { value: 2, text: 'Basic issue tracking' },
          { value: 3, text: 'Organized with labels and projects' },
          { value: 4, text: 'Full issue templates and project automation' }
        ]
      }
    ]
  },
  {
    id: 'automation',
    title: 'CI/CD Automation',
    questions: [
      {
        id: 'ci-practices',
        text: 'How automated is your CI process?',
        options: [
          { value: 1, text: 'Manual builds and tests' },
          { value: 2, text: 'Basic automated builds' },
          { value: 3, text: 'Automated builds and tests' },
          { value: 4, text: 'Full CI pipeline with quality gates' }
        ]
      },
      {
        id: 'deployment',
        text: 'How do you handle deployments?',
        options: [
          { value: 1, text: 'Manual deployments' },
          { value: 2, text: 'Semi-automated deployments' },
          { value: 3, text: 'Automated deployments to staging' },
          { value: 4, text: 'Fully automated CD pipeline' }
        ]
      },
      {
        id: 'github-actions',
        text: 'How do you utilize GitHub Actions?',
        options: [
          { value: 1, text: 'Not using GitHub Actions' },
          { value: 2, text: 'Basic workflow automation' },
          { value: 3, text: 'Multiple automated workflows' },
          { value: 4, text: 'Advanced workflows with reusable actions' }
        ]
      }
    ]
  },
  {
    id: 'release',
    title: 'Release Management',
    questions: [
      {
        id: 'versioning',
        text: 'How do you handle version control?',
        options: [
          { value: 1, text: 'No formal versioning' },
          { value: 2, text: 'Basic version numbering' },
          { value: 3, text: 'semantic versioning' },
          { value: 4, text: 'Automated semantic versioning with changelogs' }
        ]
      },
      {
        id: 'release-process',
        text: 'What is your release process?',
        options: [
          { value: 1, text: 'Manual release process' },
          { value: 2, text: 'Semi-automated releases' },
          { value: 3, text: 'release automation with basic validation' },
          { value: 4, text: 'Fully automated release pipeline with staging' }
        ]
      },
      {
        id: 'rollback',
        text: 'How do you handle rollbacks and hotfixes?',
        options: [
          { value: 1, text: 'Manual rollback process' },
          { value: 2, text: 'Basic rollback procedures' },
          { value: 3, text: 'Automated rollback capability' },
          { value: 4, text: 'Zero-downtime rollbacks and hotfix automation' }
        ]
      }
    ]
  }
];