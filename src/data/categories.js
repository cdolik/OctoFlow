
export const tooltips = {
  'gitFlow': 'A branching model that uses feature, develop, release, and master branches',
  'gitHubFlow': 'A simpler, trunk-based workflow built around GitHub features',
  'gitHubActions': 'Automate your software workflows with CI/CD',
  'gitHubAdvancedSecurity': 'Code scanning, secret scanning, and Dependabot',
  'gitHubCopilot': 'AI-powered code completion',
  'branchProtection': 'Rules that enforce code review and CI checks',
  'codeOwners': 'Automatically request reviews from the right teams',
  'dependabot': 'Automated dependency updates and security alerts',
  'issueTemplates': 'Standardized templates for bug reports and features',
  'gitHubCodespaces': 'Cloud-powered development environments',
  'gitHubDiscussions': 'Collaborative space for team communication',
  'pullRequestTemplates': 'Standardized templates for code changes',
  'gitHubCLI': 'Command-line tool for GitHub workflows',
  'gitHubTeamSync': 'Sync team membership with identity providers'
};

export const CATEGORIES = [
  {
    id: 'workflow',
    title: 'Workflow',
    description: 'Optimizing your development workflow for efficiency and collaboration.'
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Implementing automation to streamline repetitive tasks and improve consistency.'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Enhancing security practices to protect your code and infrastructure.'
  },
  {
    id: 'release',
    title: 'Release Management',
    description: 'Managing releases effectively to ensure smooth deployments and rollbacks.'
  },
  {
    id: 'governance',
    title: 'Governance',
    description: 'Implementing governance practices to ensure compliance and accountability.'
  },
  {
    id: 'optimization',
    title: 'Optimization',
    description: 'Optimizing processes and practices for better performance and efficiency.'
  }
];

export const getStageQuestions = (stage) => {
  return CATEGORIES.filter(category => category.id.includes(stage));
};

export const getCategoryWeight = (categoryId) => {
  return CATEGORIES.filter(category => category.id === categoryId).length;
};

// const STAGES is currently not used in the code
// const STAGES = [
//   {
//     id: 'pre-seed',
//     label: 'Pre-Seed Startup',
//     description: 'Just starting out with a small team',
//     benchmarks: {
//       deploymentFreq: '2/week',
//       securityLevel: 1,
//       costEfficiency: 0.8,
//       expectedScores: {
//         'github-ecosystem': 2.0,
//         'security': 1.5,
//         'ai-adoption': 1.0,
//         'automation': 1.5
//       }
//     }
//   },
//   {
//     id: 'seed',
//     label: 'Seed Stage',
//     description: 'Raised seed funding, building MVP',
//     benchmarks: {
//       deploymentFreq: '1/day',
//       securityLevel: 2,
//       costEfficiency: 0.7,
//       expectedScores: {
//         'github-ecosystem': 2.5,
//         'security': 2.5,
//         'ai-adoption': 2.0,
//         'automation': 2.5
//       }
//     }
//   },
//   {
//     id: 'series-a',
//     label: 'Series A',
//     description: 'Scaling operations and team',
//     benchmarks: {
//       deploymentFreq: 'multiple/day',
//       securityLevel: 3,
//       costEfficiency: 0.6,
//       expectedScores: {
//         'github-ecosystem': 3.5,
//         'security': 3.0,
//         'ai-adoption': 2.5,
//         'automation': 3.0
//       }
//     }
//   }
// ];
