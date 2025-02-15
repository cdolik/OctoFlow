export const tooltips = {
  'GitFlow': 'A branching model that uses feature, develop, release, and master branches to manage code releases.',
  'trunk-based development': 'A source control pattern where developers merge small, frequent updates to a core "trunk" or main branch.',
  'pull requests': 'Proposed changes to a repository submitted by a user and accepted or rejected by collaborators.',
  'CI process': 'Continuous Integration - automatically building and testing code changes when pushed to a repository.',
  'CD pipeline': 'Continuous Deployment - automatically deploying code changes to production after passing tests.',
  'quality gates': 'Predetermined criteria that must be met before code can progress to the next stage.',
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
          { value: 4, text: 'GitFlow or trunk-based development' }
        ]
      },
      {
        id: 'pr-review',
        text: 'What is your pull request review process?',
        options: [
          { value: 1, text: 'No formal review process' },
          { value: 2, text: 'Basic code review by team members' },
          { value: 3, text: 'Required reviews with checklists' },
          { value: 4, text: 'Automated checks and required reviews' }
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
      }
    ]
  }
];