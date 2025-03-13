/**
 * Assessment Service
 * 
 * This service evaluates repositories against the GitHub Well-Architected Framework
 * and generates actionable recommendations for improvement.
 */

import { 
  githubDataService, 
  RepositoryHealthInsights,
  SecurityInsights,
  ReliabilityInsights,
  MaintainabilityInsights,
  CollaborationInsights,
  VelocityInsights
} from './githubDataService';

// Define recommendation interfaces
export interface Recommendation {
  id: string;
  category: 'security' | 'reliability' | 'maintainability' | 'collaboration' | 'velocity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  actionItems: string[];
  resources: { title: string; url: string }[];
  githubActionsUrl?: string; // URL to a GitHub Actions workflow template
  settingsUrl?: string; // URL to relevant GitHub settings page
}

export interface AssessmentResult {
  repositoryInsights: RepositoryHealthInsights;
  recommendations: Recommendation[];
  prioritizedRecommendations: Recommendation[];
  quickWins: Recommendation[]; // High impact, low effort
  summary: {
    overallScore: number;
    categoryScores: {
      security: number;
      reliability: number;
      maintainability: number;
      collaboration: number;
      velocity: number;
    };
    strengths: string[];
    weaknesses: string[];
  };
}

/**
 * Assessment Service class
 */
export class AssessmentService {
  /**
   * Evaluate a repository and generate recommendations
   */
  async evaluateRepository(owner: string, repo: string): Promise<AssessmentResult> {
    // Fetch repository health insights
    const insights = await githubDataService.fetchRepositoryHealthInsights(owner, repo);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(insights);
    
    // Prioritize recommendations
    const prioritizedRecommendations = this.prioritizeRecommendations(recommendations);
    
    // Identify quick wins (high impact, low effort)
    const quickWins = recommendations.filter(
      rec => rec.impact === 'high' && rec.effort === 'low'
    );
    
    // Generate summary
    const summary = this.generateSummary(insights, recommendations);
    
    return {
      repositoryInsights: insights,
      recommendations,
      prioritizedRecommendations,
      quickWins,
      summary
    };
  }

  /**
   * Generate recommendations based on repository insights
   */
  private generateRecommendations(insights: RepositoryHealthInsights): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Add security recommendations
    recommendations.push(...this.generateSecurityRecommendations(insights.security));
    
    // Add reliability recommendations
    recommendations.push(...this.generateReliabilityRecommendations(insights.reliability));
    
    // Add maintainability recommendations
    recommendations.push(...this.generateMaintainabilityRecommendations(insights.maintainability));
    
    // Add collaboration recommendations
    recommendations.push(...this.generateCollaborationRecommendations(insights.collaboration));
    
    // Add velocity recommendations
    recommendations.push(...this.generateVelocityRecommendations(insights.velocity));
    
    return recommendations;
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(security: SecurityInsights): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check for branch protection on default branch
    if (security.branchProtectionRules.length === 0) {
      recommendations.push({
        id: 'security-branch-protection',
        category: 'security',
        title: 'Enable branch protection for your default branch',
        description: 'Branch protection prevents force pushes and accidental deletions, and can require status checks to pass before merging.',
        impact: 'high',
        effort: 'low',
        actionItems: [
          'Go to your repository settings',
          'Navigate to Branches > Branch protection rules',
          'Click "Add rule"',
          'Enter your default branch name',
          'Enable "Require pull request reviews before merging"',
          'Enable "Require status checks to pass before merging"'
        ],
        resources: [
          {
            title: 'About branch protection rules',
            url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches'
          }
        ],
        settingsUrl: 'settings/branches'
      });
    }
    
    // Check for security policy
    if (!security.hasSecurityPolicy) {
      recommendations.push({
        id: 'security-policy',
        category: 'security',
        title: 'Add a security policy to your repository',
        description: 'A security policy tells people how to report security vulnerabilities in your project.',
        impact: 'medium',
        effort: 'low',
        actionItems: [
          'Go to your repository\'s Security tab',
          'Click on "Security policy"',
          'Click "Start setup"',
          'Edit the SECURITY.md template to fit your project',
          'Commit the file to your repository'
        ],
        resources: [
          {
            title: 'Adding a security policy to your repository',
            url: 'https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository'
          }
        ],
        settingsUrl: 'security/policy'
      });
    }
    
    // Add more security recommendations as needed
    
    return recommendations;
  }

  /**
   * Generate reliability recommendations
   */
  private generateReliabilityRecommendations(reliability: ReliabilityInsights): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check for CI/CD setup
    if (!reliability.cicdSetup) {
      recommendations.push({
        id: 'reliability-cicd',
        category: 'reliability',
        title: 'Set up CI/CD with GitHub Actions',
        description: 'Continuous Integration and Continuous Deployment help catch bugs early and automate your deployment process.',
        impact: 'high',
        effort: 'medium',
        actionItems: [
          'Go to your repository\'s Actions tab',
          'Choose a workflow template that matches your project type',
          'Customize the workflow to fit your project\'s needs',
          'Commit the workflow file to your repository'
        ],
        resources: [
          {
            title: 'GitHub Actions quickstart',
            url: 'https://docs.github.com/en/actions/quickstart'
          }
        ],
        githubActionsUrl: 'actions/new'
      });
    }
    
    // Check for workflow success rate
    if (reliability.successRate < 80 && reliability.workflowRuns.length > 0) {
      recommendations.push({
        id: 'reliability-workflow-success',
        category: 'reliability',
        title: 'Improve GitHub Actions workflow success rate',
        description: `Your workflow success rate is ${reliability.successRate.toFixed(1)}%. Aim for at least 80% to ensure reliable builds.`,
        impact: 'high',
        effort: 'medium',
        actionItems: [
          'Review recent workflow failures',
          'Fix common failure patterns',
          'Add better error handling to your workflows',
          'Consider using caching to improve reliability'
        ],
        resources: [
          {
            title: 'Workflow syntax for GitHub Actions',
            url: 'https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions'
          }
        ]
      });
    }
    
    // Add more reliability recommendations as needed
    
    return recommendations;
  }

  /**
   * Generate maintainability recommendations
   */
  private generateMaintainabilityRecommendations(maintainability: MaintainabilityInsights): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check for README
    if (!maintainability.hasReadme) {
      recommendations.push({
        id: 'maintainability-readme',
        category: 'maintainability',
        title: 'Add a README file to your repository',
        description: 'A README file helps users understand your project, how to use it, and how to contribute.',
        impact: 'high',
        effort: 'low',
        actionItems: [
          'Create a README.md file in your repository root',
          'Include project description, installation instructions, and usage examples',
          'Add badges for build status, code coverage, and other metrics'
        ],
        resources: [
          {
            title: 'About READMEs',
            url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes'
          }
        ]
      });
    } else if (maintainability.readmeQuality < 50) {
      recommendations.push({
        id: 'maintainability-readme-quality',
        category: 'maintainability',
        title: 'Improve your README file',
        description: 'Your README file could be more comprehensive. A good README helps users understand your project.',
        impact: 'medium',
        effort: 'low',
        actionItems: [
          'Add more detailed installation instructions',
          'Include usage examples',
          'Add screenshots or diagrams',
          'Include information about how to contribute'
        ],
        resources: [
          {
            title: 'Making READMEs readable',
            url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes#making-readmes-readable'
          }
        ]
      });
    }
    
    // Check for CODEOWNERS
    if (!maintainability.codeOwners) {
      recommendations.push({
        id: 'maintainability-codeowners',
        category: 'maintainability',
        title: 'Add a CODEOWNERS file',
        description: 'A CODEOWNERS file defines who is responsible for code in your repository, and automatically requests reviews from the owners when a pull request changes their code.',
        impact: 'medium',
        effort: 'low',
        actionItems: [
          'Create a .github/CODEOWNERS file',
          'Define ownership patterns for different parts of your codebase',
          'Ensure all critical code paths have owners'
        ],
        resources: [
          {
            title: 'About code owners',
            url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners'
          }
        ]
      });
    }
    
    // Add more maintainability recommendations as needed
    
    return recommendations;
  }

  /**
   * Generate collaboration recommendations
   */
  private generateCollaborationRecommendations(collaboration: CollaborationInsights): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check for PR templates
    if (!collaboration.prTemplates) {
      recommendations.push({
        id: 'collaboration-pr-template',
        category: 'collaboration',
        title: 'Add a pull request template',
        description: 'PR templates help contributors provide all the necessary information when opening a pull request.',
        impact: 'medium',
        effort: 'low',
        actionItems: [
          'Create a .github/PULL_REQUEST_TEMPLATE.md file',
          'Include sections for description, related issues, and testing',
          'Add a checklist for contributors to follow'
        ],
        resources: [
          {
            title: 'Creating a pull request template',
            url: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository'
          }
        ]
      });
    }
    
    // Check for issue templates
    if (!collaboration.issueTemplates) {
      recommendations.push({
        id: 'collaboration-issue-template',
        category: 'collaboration',
        title: 'Add issue templates',
        description: 'Issue templates help contributors provide all the necessary information when opening an issue.',
        impact: 'medium',
        effort: 'low',
        actionItems: [
          'Go to your repository settings',
          'Navigate to Options > Features > Issues > Set up templates',
          'Choose "Add template: select"',
          'Select the template types you want to add (bug report, feature request, etc.)',
          'Customize the templates to fit your project'
        ],
        resources: [
          {
            title: 'Configuring issue templates',
            url: 'https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository'
          }
        ],
        settingsUrl: 'settings/issues'
      });
    }
    
    // Check for PR review time
    if (collaboration.avgReviewTime > 48) {
      recommendations.push({
        id: 'collaboration-review-time',
        category: 'collaboration',
        title: 'Reduce pull request review time',
        description: `Your average PR review time is ${collaboration.avgReviewTime.toFixed(1)} hours. Aim for less than 24 hours to maintain momentum.`,
        impact: 'high',
        effort: 'medium',
        actionItems: [
          'Set up notifications for new pull requests',
          'Establish a rotation for PR reviews',
          'Consider using GitHub\'s auto-assignment feature',
          'Set clear expectations for review turnaround time'
        ],
        resources: [
          {
            title: 'Managing code review assignment',
            url: 'https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-assignment-for-your-team'
          }
        ]
      });
    }
    
    // Add more collaboration recommendations as needed
    
    return recommendations;
  }

  /**
   * Generate velocity recommendations
   */
  private generateVelocityRecommendations(velocity: VelocityInsights): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check for time to merge
    if (velocity.timeToMerge > 72) {
      recommendations.push({
        id: 'velocity-merge-time',
        category: 'velocity',
        title: 'Reduce time to merge pull requests',
        description: `Your average time to merge is ${velocity.timeToMerge.toFixed(1)} hours. Aim for less than 48 hours to maintain momentum.`,
        impact: 'high',
        effort: 'medium',
        actionItems: [
          'Encourage smaller, more focused pull requests',
          'Set up automated tests to speed up validation',
          'Establish a rotation for PR reviews',
          'Consider using GitHub\'s auto-assignment feature'
        ],
        resources: [
          {
            title: 'GitHub flow',
            url: 'https://docs.github.com/en/get-started/quickstart/github-flow'
          }
        ]
      });
    }
    
    // Check for PR size
    if (velocity.prSize > 500) {
      recommendations.push({
        id: 'velocity-pr-size',
        category: 'velocity',
        title: 'Reduce pull request size',
        description: `Your average PR size is ${velocity.prSize.toFixed(0)} lines. Smaller PRs are easier to review and merge faster.`,
        impact: 'medium',
        effort: 'medium',
        actionItems: [
          'Break down large features into smaller, incremental changes',
          'Focus each PR on a single concern or feature',
          'Consider using feature flags for work-in-progress features'
        ],
        resources: [
          {
            title: 'How to write the perfect pull request',
            url: 'https://github.blog/2015-01-21-how-to-write-the-perfect-pull-request/'
          }
        ]
      });
    }
    
    // Add more velocity recommendations as needed
    
    return recommendations;
  }

  /**
   * Prioritize recommendations based on impact and effort
   */
  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    // Define priority scores for impact and effort
    const impactScores = { high: 3, medium: 2, low: 1 };
    const effortScores = { low: 3, medium: 2, high: 1 }; // Inverse scoring for effort (lower effort = higher score)
    
    // Calculate priority score for each recommendation
    const scoredRecommendations = recommendations.map(rec => {
      const impactScore = impactScores[rec.impact];
      const effortScore = effortScores[rec.effort];
      const priorityScore = impactScore * effortScore; // Higher score = higher priority
      
      return { recommendation: rec, priorityScore };
    });
    
    // Sort by priority score (descending)
    scoredRecommendations.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Return sorted recommendations
    return scoredRecommendations.map(item => item.recommendation);
  }

  /**
   * Generate summary of assessment
   */
  private generateSummary(
    insights: RepositoryHealthInsights,
    recommendations: Recommendation[]
  ): AssessmentResult['summary'] {
    // Extract category scores
    const categoryScores = {
      security: insights.security.securityScore,
      reliability: insights.reliability.reliabilityScore,
      maintainability: insights.maintainability.maintainabilityScore,
      collaboration: insights.collaboration.collaborationScore,
      velocity: insights.velocity.velocityScore
    };
    
    // Identify strengths (categories with scores >= 70)
    const strengths = Object.entries(categoryScores)
      .filter(([_, score]) => score >= 70)
      .map(([category, score]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        return `${categoryName} (${score.toFixed(0)}%)`;
      });
    
    // Identify weaknesses (categories with scores < 50)
    const weaknesses = Object.entries(categoryScores)
      .filter(([_, score]) => score < 50)
      .map(([category, score]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        return `${categoryName} (${score.toFixed(0)}%)`;
      });
    
    return {
      overallScore: insights.overallScore,
      categoryScores,
      strengths,
      weaknesses
    };
  }
}

// Export singleton instance
export const assessmentService = new AssessmentService(); 