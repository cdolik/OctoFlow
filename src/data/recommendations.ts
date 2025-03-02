import { Recommendation } from '../types';

// Sample recommendations for GitHub workflow improvements
export const recommendations: Recommendation[] = [
  {
    id: 'cicd-1',
    text: 'Implement CI/CD pipeline with GitHub Actions',
    githubUrl: 'https://github.com/features/actions',
    category: 'cicd',
    priority: 'high',
    applicableScores: { cicd: [0, 1] }
  },
  {
    id: 'security-1',
    text: 'Add CodeQL scanning to identify security vulnerabilities',
    githubUrl: 'https://github.com/github/codeql-action',
    category: 'security',
    priority: 'high',
    applicableScores: { security: [0, 1, 2] }
  },
  {
    id: 'testing-1',
    text: 'Set up automated testing workflow',
    githubUrl: 'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs',
    category: 'testing',
    priority: 'medium',
    applicableScores: { testing: [0, 1] }
  },
  {
    id: 'deployment-1',
    text: 'Configure automatic deployment to staging environments',
    githubUrl: 'https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider',
    category: 'deployment',
    priority: 'medium',
    applicableScores: { deployment: [0, 1, 2] }
  },
  {
    id: 'code-1',
    text: 'Set up linting and code formatting checks',
    githubUrl: 'https://github.com/marketplace/actions/super-linter',
    category: 'code',
    priority: 'low',
    applicableScores: { code: [0, 1] }
  },
  {
    id: 'dependency-1',
    text: 'Add Dependabot for automatic dependency updates',
    githubUrl: 'https://docs.github.com/en/code-security/dependabot/dependabot-version-updates',
    category: 'dependency',
    priority: 'medium',
    applicableScores: { dependency: [0, 1, 2] }
  },
  {
    id: 'review-1',
    text: 'Implement branch protection and required code reviews',
    githubUrl: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches',
    category: 'review',
    priority: 'high',
    applicableScores: { review: [0, 1] }
  },
  {
    id: 'monitor-1',
    text: 'Set up GitHub Actions for monitoring and alerting',
    githubUrl: 'https://github.com/marketplace?type=actions&query=monitoring',
    category: 'monitor',
    priority: 'low',
    applicableScores: { monitor: [0, 1, 2] }
  },
  // Additional GitHub-specific recommendations
  {
    id: 'workflow-1',
    text: 'Implement GitHub Flow branching strategy',
    githubUrl: 'https://docs.github.com/en/get-started/quickstart/github-flow',
    category: 'workflow',
    priority: 'high',
    applicableScores: { workflow: [0, 1] }
  },
  {
    id: 'security-2',
    text: 'Enable Dependabot security alerts',
    githubUrl: 'https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates',
    category: 'security',
    priority: 'high',
    applicableScores: { security: [0, 1, 2, 3] }
  },
  {
    id: 'automation-1',
    text: 'Set up issue templates and automated labeling',
    githubUrl: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository',
    category: 'automation',
    priority: 'medium',
    applicableScores: { automation: [0, 1, 2] }
  },
  {
    id: 'collaboration-1',
    text: 'Configure GitHub Projects for agile workflow',
    githubUrl: 'https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects',
    category: 'collaboration',
    priority: 'medium',
    applicableScores: { collaboration: [0, 1, 2] }
  },
  {
    id: 'quality-1',
    text: 'Set up code coverage reporting with GitHub Actions',
    githubUrl: 'https://github.com/marketplace/actions/codecov',
    category: 'quality',
    priority: 'medium',
    applicableScores: { quality: [0, 1, 2] }
  },
  {
    id: 'release-1',
    text: 'Automate release notes generation',
    githubUrl: 'https://github.com/marketplace/actions/release-drafter',
    category: 'release',
    priority: 'low',
    applicableScores: { release: [0, 1, 2] }
  }
];

/**
 * Get recommendations based on the assessment scores
 * @param scores Object containing category scores
 * @returns Array of applicable recommendations
 */
export const getRecommendationsByScores = (scores: Record<string, number>): Recommendation[] => {
  return recommendations.filter(rec => {
    // Check if this recommendation applies based on scores
    for (const [category, scoreRange] of Object.entries(rec.applicableScores)) {
      // If we have a score for this category and it's in the applicable range
      if (scores[category] !== undefined && scoreRange.includes(scores[category])) {
        return true;
      }
    }
    return false;
  });
};
