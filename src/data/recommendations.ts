export interface Recommendation {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  steps: string[];
  githubUrl: string;
  stage: 'seed' | 'series-a' | 'series-b';
  applicableScores: {
    [key: string]: [number, number]; // [min, max] score range
  };
}

export const recommendations: Recommendation[] = [
  // Seed stage recommendations - CI/CD
  {
    id: 'seed-cicd-1',
    title: 'Setup GitHub Actions for Continuous Integration',
    priority: 'high',
    impact: 'cicd',
    effort: 'low',
    steps: [
      'Create a .github/workflows directory in your repository',
      'Add a simple CI workflow YAML file that runs on push and pull requests',
      'Configure it to build your project and run basic tests'
    ],
    githubUrl: 'https://docs.github.com/en/actions/quickstart',
    stage: 'seed',
    applicableScores: {
      'cicd': [0, 2]
    }
  },
  {
    id: 'seed-cicd-2',
    title: 'Implement Pull Request Checks',
    priority: 'medium',
    impact: 'cicd',
    effort: 'low',
    steps: [
      'Configure GitHub Actions to run on pull requests',
      'Set up required checks for pull requests',
      'Enforce checks to pass before merging'
    ],
    githubUrl: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches',
    stage: 'seed',
    applicableScores: {
      'cicd': [0, 2]
    }
  },

  // Seed stage recommendations - Security
  {
    id: 'seed-security-1',
    title: 'Enforce Branch Protection Rules',
    priority: 'high',
    impact: 'security',
    effort: 'low',
    steps: [
      'Navigate to repository settings on GitHub',
      'Enable branch protection on main branch',
      'Require PR reviews before merging'
    ],
    githubUrl: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches',
    stage: 'seed',
    applicableScores: {
      'security': [0, 2]
    }
  },
  {
    id: 'seed-security-2',
    title: 'Enable Dependabot Alerts',
    priority: 'high',
    impact: 'security',
    effort: 'low',
    steps: [
      'Go to repository Settings > Security & analysis',
      'Enable Dependabot alerts',
      'Configure automatic security updates'
    ],
    githubUrl: 'https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts',
    stage: 'seed',
    applicableScores: {
      'security': [0, 2]
    }
  },

  // Seed stage recommendations - Testing
  {
    id: 'seed-testing-1',
    title: 'Set Up Basic Unit Tests',
    priority: 'high',
    impact: 'testing',
    effort: 'medium',
    steps: [
      'Choose a testing framework appropriate for your language',
      'Create initial test files for critical components',
      'Add tests to your CI pipeline in GitHub Actions'
    ],
    githubUrl: 'https://github.com/features/actions',
    stage: 'seed',
    applicableScores: {
      'testing': [0, 2]
    }
  },

  // Series A stage recommendations - CI/CD
  {
    id: 'series-a-cicd-1',
    title: 'Implement Deployment Environments',
    priority: 'high',
    impact: 'cicd',
    effort: 'medium',
    steps: [
      'Set up different environments (staging, production) in GitHub',
      'Configure environment-specific secrets and variables',
      'Create deployment workflows with proper approvals'
    ],
    githubUrl: 'https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment',
    stage: 'series-a',
    applicableScores: {
      'cicd': [1, 3]
    }
  },
  {
    id: 'series-a-cicd-2',
    title: 'Implement Release Management',
    priority: 'medium',
    impact: 'cicd',
    effort: 'medium',
    steps: [
      'Use GitHub Releases for versioning',
      'Automate release notes generation',
      'Configure semantic versioning for your packages'
    ],
    githubUrl: 'https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases',
    stage: 'series-a',
    applicableScores: {
      'cicd': [1, 3]
    }
  },

  // Series A stage recommendations - Security
  {
    id: 'series-a-security-1',
    title: 'Set Up Code Scanning with CodeQL',
    priority: 'high',
    impact: 'security',
    effort: 'medium',
    steps: [
      'Enable Code Scanning in repository security settings',
      'Configure CodeQL analysis workflow',
      'Address identified security vulnerabilities'
    ],
    githubUrl: 'https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning',
    stage: 'series-a',
    applicableScores: {
      'security': [1, 3]
    }
  },
  {
    id: 'series-a-security-2',
    title: 'Implement Secret Scanning',
    priority: 'high',
    impact: 'security',
    effort: 'low',
    steps: [
      'Enable Secret Scanning in repository settings',
      'Configure alerts for exposed secrets',
      'Set up remediation processes for leaked secrets'
    ],
    githubUrl: 'https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning',
    stage: 'series-a',
    applicableScores: {
      'security': [1, 3]
    }
  },

  // Series A stage recommendations - Testing
  {
    id: 'series-a-testing-1',
    title: 'Implement Code Coverage Reporting',
    priority: 'medium',
    impact: 'testing',
    effort: 'medium',
    steps: [
      'Set up a code coverage tool in your test suite',
      'Configure coverage thresholds in CI/CD',
      'Add coverage badges to your README'
    ],
    githubUrl: 'https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs',
    stage: 'series-a',
    applicableScores: {
      'testing': [1, 3]
    }
  },

  // Series B+ stage recommendations - CI/CD
  {
    id: 'series-b-cicd-1',
    title: 'Implement Deployment Gates',
    priority: 'high',
    impact: 'cicd',
    effort: 'high',
    steps: [
      'Set up quality and security gates for deployments',
      'Configure progressive deployment strategies',
      'Implement canary releases or feature flags'
    ],
    githubUrl: 'https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment',
    stage: 'series-b',
    applicableScores: {
      'cicd': [2, 4]
    }
  },
  {
    id: 'series-b-cicd-2',
    title: 'Create Reusable Workflows',
    priority: 'medium',
    impact: 'cicd',
    effort: 'medium',
    steps: [
      'Identify common CI/CD patterns across repositories',
      'Create reusable workflow templates in your organization',
      'Implement centralized workflow management'
    ],
    githubUrl: 'https://docs.github.com/en/actions/using-workflows/reusing-workflows',
    stage: 'series-b',
    applicableScores: {
      'cicd': [2, 4]
    }
  },

  // Series B+ stage recommendations - Security
  {
    id: 'series-b-security-1',
    title: 'Implement Security Risk Management',
    priority: 'high',
    impact: 'security',
    effort: 'high',
    steps: [
      'Create a security vulnerability management process',
      'Configure prioritization for security alerts',
      'Establish SLAs for addressing various risk levels'
    ],
    githubUrl: 'https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning',
    stage: 'series-b',
    applicableScores: {
      'security': [2, 4]
    }
  },
  {
    id: 'series-b-security-2',
    title: 'Set Up Organization-wide Security Policies',
    priority: 'high',
    impact: 'security',
    effort: 'high',
    steps: [
      'Create organization-level security policies',
      'Configure default security settings for all repositories',
      'Implement security report templates and processes'
    ],
    githubUrl: 'https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization',
    stage: 'series-b',
    applicableScores: {
      'security': [2, 4]
    }
  },

  // Series B+ stage recommendations - Testing
  {
    id: 'series-b-testing-1',
    title: 'Implement Advanced Testing Strategies',
    priority: 'medium',
    impact: 'testing',
    effort: 'high',
    steps: [
      'Set up comprehensive end-to-end testing frameworks',
      'Implement performance testing in CI/CD',
      'Add chaos engineering practices to verify resilience'
    ],
    githubUrl: 'https://github.com/features/actions',
    stage: 'series-b',
    applicableScores: {
      'testing': [2, 4]
    }
  }
];

/**
 * Get recommendations filtered by scores and optionally by stage
 * @param scores Object with category scores
 * @param stage Optional stage filter
 * @returns Array of filtered recommendations
 */
export function getRecommendationsByScores(
  scores: Record<string, number>,
  stage?: string
): Recommendation[] {
  if (Object.keys(scores).length === 0) return [];

  return recommendations.filter(rec => {
    // Filter by stage if provided
    if (stage && rec.stage !== stage) return false;

    // Check if any applicable score ranges match the user's scores
    return Object.entries(rec.applicableScores).some(([category, [min, max]]) => {
      const score = scores[category];
      return score !== undefined && score >= min && score <= max;
    });
  });
}
