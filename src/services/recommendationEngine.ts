/**
 * Recommendation Engine Service
 * 
 * This service provides AI-powered recommendations based on repository assessments.
 * It enhances the basic recommendations from the assessment service with more
 * contextual, personalized, and actionable insights.
 */

import { assessmentService, AssessmentResult, Recommendation } from './assessmentService';

// Define enhanced recommendation interfaces
export interface EnhancedRecommendation extends Recommendation {
  automationPossible: boolean;
  automationScript?: string;
  estimatedTimeToImplement: string; // e.g., "5-10 minutes", "1-2 hours"
  businessImpact: string;
  implementationSteps: {
    step: string;
    details: string;
    codeSnippet?: string;
  }[];
}

export interface RecommendationContext {
  repositorySize: number;
  primaryLanguage: string;
  teamSize: number;
  isPublic: boolean;
  hasCI: boolean;
  recentActivity: {
    commits: number;
    pullRequests: number;
    issues: number;
  };
}

export interface EnhancedAssessmentResult extends Omit<AssessmentResult, 'recommendations' | 'prioritizedRecommendations' | 'quickWins'> {
  recommendations: EnhancedRecommendation[];
  prioritizedRecommendations: EnhancedRecommendation[];
  quickWins: EnhancedRecommendation[];
  context: RecommendationContext;
  nextSteps: {
    immediate: EnhancedRecommendation[];
    shortTerm: EnhancedRecommendation[];
    longTerm: EnhancedRecommendation[];
  };
  implementationPlan: {
    title: string;
    description: string;
    steps: {
      name: string;
      recommendations: string[]; // IDs of recommendations
      estimatedEffort: string;
      expectedOutcome: string;
    }[];
  };
}

/**
 * Recommendation Engine class
 */
export class RecommendationEngine {
  /**
   * Generate enhanced recommendations for a repository
   */
  async generateRecommendations(owner: string, repo: string): Promise<EnhancedAssessmentResult> {
    // Get basic assessment result
    const assessmentResult = await assessmentService.evaluateRepository(owner, repo);
    
    // Get repository context
    const context = await this.getRepositoryContext(owner, repo);
    
    // Enhance recommendations
    const enhancedRecommendations = this.enhanceRecommendations(
      assessmentResult.recommendations,
      context
    );
    
    // Prioritize enhanced recommendations
    const prioritizedRecommendations = this.prioritizeEnhancedRecommendations(
      enhancedRecommendations,
      context
    );
    
    // Identify quick wins
    const quickWins = enhancedRecommendations.filter(
      rec => rec.impact === 'high' && rec.effort === 'low'
    );
    
    // Generate next steps
    const nextSteps = this.generateNextSteps(enhancedRecommendations);
    
    // Generate implementation plan
    const implementationPlan = this.generateImplementationPlan(
      enhancedRecommendations,
      context
    );
    
    return {
      repositoryInsights: assessmentResult.repositoryInsights,
      recommendations: enhancedRecommendations,
      prioritizedRecommendations,
      quickWins,
      summary: assessmentResult.summary,
      context,
      nextSteps,
      implementationPlan
    };
  }

  /**
   * Get repository context for better recommendations
   */
  private async getRepositoryContext(owner: string, repo: string): Promise<RecommendationContext> {
    // In a real implementation, this would fetch data from GitHub API
    // For now, we'll return mock data
    return {
      repositorySize: 1024, // KB
      primaryLanguage: 'TypeScript',
      teamSize: 3,
      isPublic: true,
      hasCI: true,
      recentActivity: {
        commits: 45,
        pullRequests: 12,
        issues: 8
      }
    };
  }

  /**
   * Enhance basic recommendations with more context and actionable steps
   */
  private enhanceRecommendations(
    recommendations: Recommendation[],
    context: RecommendationContext
  ): EnhancedRecommendation[] {
    return recommendations.map(rec => {
      // Start with the base recommendation
      const enhanced: EnhancedRecommendation = {
        ...rec,
        automationPossible: false,
        estimatedTimeToImplement: this.estimateImplementationTime(rec, context),
        businessImpact: this.determineBusinessImpact(rec),
        implementationSteps: this.generateImplementationSteps(rec, context)
      };
      
      // Check if automation is possible
      if (this.canBeAutomated(rec, context)) {
        enhanced.automationPossible = true;
        enhanced.automationScript = this.generateAutomationScript(rec, context);
      }
      
      return enhanced;
    });
  }

  /**
   * Estimate time to implement a recommendation
   */
  private estimateImplementationTime(
    recommendation: Recommendation,
    context: RecommendationContext
  ): string {
    // Implementation time estimates based on recommendation category and effort
    const timeEstimates: Record<string, Record<string, string>> = {
      security: {
        low: '10-30 minutes',
        medium: '1-2 hours',
        high: '4-8 hours'
      },
      reliability: {
        low: '15-45 minutes',
        medium: '2-4 hours',
        high: '1-2 days'
      },
      maintainability: {
        low: '5-20 minutes',
        medium: '1-3 hours',
        high: '4-8 hours'
      },
      collaboration: {
        low: '10-30 minutes',
        medium: '1-2 hours',
        high: '3-6 hours'
      },
      velocity: {
        low: '15-45 minutes',
        medium: '2-4 hours',
        high: '1-2 days'
      }
    };
    
    return timeEstimates[recommendation.category][recommendation.effort] || '1-4 hours';
  }

  /**
   * Determine business impact of a recommendation
   */
  private determineBusinessImpact(recommendation: Recommendation): string {
    // Business impact descriptions based on recommendation category and impact
    const impactDescriptions: Record<string, Record<string, string>> = {
      security: {
        high: 'Significantly reduces security vulnerabilities, protecting your codebase and user data from potential breaches.',
        medium: 'Improves security posture and reduces risk of security incidents.',
        low: 'Enhances security best practices and awareness.'
      },
      reliability: {
        high: 'Dramatically improves system stability and reduces downtime, leading to better user experience and trust.',
        medium: 'Increases reliability and reduces the likelihood of service disruptions.',
        low: 'Improves system resilience and error handling.'
      },
      maintainability: {
        high: 'Substantially reduces technical debt and makes the codebase significantly easier to maintain and extend.',
        medium: 'Improves code quality and makes future development more efficient.',
        low: 'Enhances code organization and documentation.'
      },
      collaboration: {
        high: 'Greatly enhances team productivity and reduces communication overhead, leading to faster delivery.',
        medium: 'Improves team coordination and reduces friction in the development process.',
        low: 'Enhances collaboration practices and team awareness.'
      },
      velocity: {
        high: 'Significantly accelerates development speed and time-to-market for new features.',
        medium: 'Improves development velocity and reduces bottlenecks.',
        low: 'Enhances workflow efficiency and reduces manual steps.'
      }
    };
    
    return impactDescriptions[recommendation.category][recommendation.impact] || 
      'Improves overall repository health and development practices.';
  }

  /**
   * Generate detailed implementation steps for a recommendation
   */
  private generateImplementationSteps(
    recommendation: Recommendation,
    context: RecommendationContext
  ): EnhancedRecommendation['implementationSteps'] {
    // Base implementation steps from the recommendation's actionItems
    const baseSteps = recommendation.actionItems.map(item => ({
      step: item,
      details: this.expandActionItemDetails(item, recommendation, context)
    }));
    
    // Add code snippets where applicable
    return this.addCodeSnippets(baseSteps, recommendation, context);
  }

  /**
   * Expand action item with more detailed instructions
   */
  private expandActionItemDetails(
    actionItem: string,
    recommendation: Recommendation,
    context: RecommendationContext
  ): string {
    // This would be more sophisticated in a real implementation
    // For now, we'll add some basic expansions
    
    if (actionItem.includes('branch protection')) {
      return 'Branch protection is essential for preventing accidental or malicious changes to important branches. ' +
        'In the repository settings, you can configure rules that enforce code review, status checks, and more.';
    }
    
    if (actionItem.includes('security policy')) {
      return 'A security policy helps contributors understand how to report security vulnerabilities. ' +
        'GitHub provides a template that you can customize to fit your project\'s needs.';
    }
    
    if (actionItem.includes('CI/CD')) {
      return 'Continuous Integration and Continuous Deployment automate testing and deployment, ' +
        'reducing manual errors and ensuring consistent quality. GitHub Actions provides a simple way to set this up.';
    }
    
    if (actionItem.includes('README')) {
      return 'A good README is the first thing visitors see. It should explain what your project does, ' +
        'how to install and use it, and how to contribute. Consider adding badges to show build status and other metrics.';
    }
    
    // Default expansion
    return 'Follow GitHub\'s documentation for detailed instructions on implementing this recommendation.';
  }

  /**
   * Add code snippets to implementation steps where applicable
   */
  private addCodeSnippets(
    steps: EnhancedRecommendation['implementationSteps'],
    recommendation: Recommendation,
    context: RecommendationContext
  ): EnhancedRecommendation['implementationSteps'] {
    // Clone steps to avoid modifying the original
    const enhancedSteps = [...steps];
    
    // Add code snippets based on recommendation type
    if (recommendation.id === 'security-branch-protection') {
      // No code snippet needed for UI-based action
    }
    
    if (recommendation.id === 'reliability-cicd') {
      // Find the step about customizing workflow
      const workflowStep = enhancedSteps.findIndex(step => 
        step.step.includes('Customize the workflow')
      );
      
      if (workflowStep !== -1) {
        enhancedSteps[workflowStep].codeSnippet = `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build
      run: npm run build`;
      }
    }
    
    if (recommendation.id === 'maintainability-codeowners') {
      // Find the step about creating CODEOWNERS file
      const codeownersStep = enhancedSteps.findIndex(step => 
        step.step.includes('Create a .github/CODEOWNERS')
      );
      
      if (codeownersStep !== -1) {
        enhancedSteps[codeownersStep].codeSnippet = `# These owners will be the default owners for everything in
# the repo. Unless a later match takes precedence,
# @global-owner1 and @global-owner2 will be requested for
# review when someone opens a pull request.
* @global-owner1 @global-owner2

# Order is important; the last matching pattern takes the most
# precedence. When someone opens a pull request that only
# modifies JS files, only @js-owner and not the global
# owner(s) will be requested for a review.
*.js    @js-owner

# You can also use email addresses if you prefer. They'll be
# used to look up users just like we do for commit author
# emails.
*.go docs@example.com

# Teams can be specified as code owners as well. Teams should
# be identified in the format @org/team-name. Teams must have
# explicit write access to the repository.
/docs/  @org/docs-team`;
      }
    }
    
    if (recommendation.id === 'collaboration-pr-template') {
      // Find the step about creating PR template
      const prTemplateStep = enhancedSteps.findIndex(step => 
        step.step.includes('Create a .github/PULL_REQUEST_TEMPLATE.md')
      );
      
      if (prTemplateStep !== -1) {
        enhancedSteps[prTemplateStep].codeSnippet = `## Description
Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context.

Fixes # (issue)

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce.

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes`;
      }
    }
    
    return enhancedSteps;
  }

  /**
   * Check if a recommendation can be automated
   */
  private canBeAutomated(
    recommendation: Recommendation,
    context: RecommendationContext
  ): boolean {
    // Determine if the recommendation can be automated
    // This would be more sophisticated in a real implementation
    
    // Some recommendations that can be automated
    const automatable = [
      'security-branch-protection',
      'security-policy',
      'reliability-cicd',
      'maintainability-readme',
      'maintainability-codeowners',
      'collaboration-pr-template',
      'collaboration-issue-template'
    ];
    
    return automatable.includes(recommendation.id);
  }

  /**
   * Generate automation script for a recommendation
   */
  private generateAutomationScript(
    recommendation: Recommendation,
    context: RecommendationContext
  ): string {
    // This would generate GitHub Actions workflow or script to implement the recommendation
    // For now, we'll return placeholder scripts
    
    if (recommendation.id === 'security-branch-protection') {
      return `# GitHub CLI script to enable branch protection
gh api repos/{owner}/{repo}/branches/{branch}/protection \\
  --method PUT \\
  --input - << EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["continuous-integration/travis-ci"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
EOF`;
    }
    
    if (recommendation.id === 'security-policy') {
      return `# GitHub Actions workflow to add security policy
name: Add Security Policy

on:
  workflow_dispatch:

jobs:
  add-security-policy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create SECURITY.md
        run: |
          cat > SECURITY.md << 'EOL'
          # Security Policy

          ## Supported Versions

          Use this section to tell people about which versions of your project are
          currently being supported with security updates.

          | Version | Supported          |
          | ------- | ------------------ |
          | 1.0.x   | :white_check_mark: |
          | < 1.0   | :x:                |

          ## Reporting a Vulnerability

          Use this section to tell people how to report a vulnerability.

          Tell them where to go, how often they can expect to get an update on a
          reported vulnerability, what to expect if the vulnerability is accepted or
          declined, etc.
          EOL
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add SECURITY.md
          git commit -m "Add security policy"
          git push`;
    }
    
    // Default script
    return `# This is a placeholder for an automation script
# A real implementation would provide a GitHub Actions workflow
# or CLI script to implement this recommendation automatically`;
  }

  /**
   * Prioritize enhanced recommendations based on context
   */
  private prioritizeEnhancedRecommendations(
    recommendations: EnhancedRecommendation[],
    context: RecommendationContext
  ): EnhancedRecommendation[] {
    // Define priority scores for impact and effort
    const impactScores = { high: 3, medium: 2, low: 1 };
    const effortScores = { low: 3, medium: 2, high: 1 }; // Inverse scoring for effort (lower effort = higher score)
    
    // Calculate priority score for each recommendation
    const scoredRecommendations = recommendations.map(rec => {
      const impactScore = impactScores[rec.impact];
      const effortScore = effortScores[rec.effort];
      
      // Base priority score
      let priorityScore = impactScore * effortScore;
      
      // Adjust priority based on context
      
      // For small repos, prioritize maintainability
      if (context.repositorySize < 500 && rec.category === 'maintainability') {
        priorityScore *= 1.5;
      }
      
      // For public repos, prioritize security
      if (context.isPublic && rec.category === 'security') {
        priorityScore *= 2;
      }
      
      // For active repos, prioritize collaboration
      if (context.recentActivity.pullRequests > 10 && rec.category === 'collaboration') {
        priorityScore *= 1.3;
      }
      
      // For repos with CI, prioritize reliability
      if (context.hasCI && rec.category === 'reliability') {
        priorityScore *= 1.2;
      }
      
      // Prioritize automatable recommendations
      if (rec.automationPossible) {
        priorityScore *= 1.5;
      }
      
      return { recommendation: rec, priorityScore };
    });
    
    // Sort by priority score (descending)
    scoredRecommendations.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Return sorted recommendations
    return scoredRecommendations.map(item => item.recommendation);
  }

  /**
   * Generate next steps categorized by timeframe
   */
  private generateNextSteps(
    recommendations: EnhancedRecommendation[]
  ): EnhancedAssessmentResult['nextSteps'] {
    // Sort recommendations by priority (impact * effort)
    const sortedRecs = [...recommendations].sort((a, b) => {
      const aScore = this.getPriorityScore(a);
      const bScore = this.getPriorityScore(b);
      return bScore - aScore;
    });
    
    // Take top 3 for immediate, next 5 for short term, rest for long term
    return {
      immediate: sortedRecs.slice(0, 3),
      shortTerm: sortedRecs.slice(3, 8),
      longTerm: sortedRecs.slice(8)
    };
  }

  /**
   * Get priority score for a recommendation
   */
  private getPriorityScore(recommendation: EnhancedRecommendation): number {
    const impactScores = { high: 3, medium: 2, low: 1 };
    const effortScores = { low: 3, medium: 2, high: 1 }; // Inverse scoring for effort (lower effort = higher score)
    
    const impactScore = impactScores[recommendation.impact];
    const effortScore = effortScores[recommendation.effort];
    
    return impactScore * effortScore;
  }

  /**
   * Generate implementation plan
   */
  private generateImplementationPlan(
    recommendations: EnhancedRecommendation[],
    context: RecommendationContext
  ): EnhancedAssessmentResult['implementationPlan'] {
    // Group recommendations by category
    const categorized = recommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, EnhancedRecommendation[]>);
    
    // Create implementation plan
    return {
      title: 'GitHub Well-Architected Implementation Plan',
      description: 'A phased approach to implementing the recommendations and improving your repository health.',
      steps: [
        {
          name: 'Foundation: Security & Reliability',
          recommendations: [
            ...(categorized.security || []).slice(0, 3).map(r => r.id),
            ...(categorized.reliability || []).slice(0, 2).map(r => r.id)
          ],
          estimatedEffort: '1-2 days',
          expectedOutcome: 'Improved security posture and reliability foundation.'
        },
        {
          name: 'Efficiency: Maintainability & Collaboration',
          recommendations: [
            ...(categorized.maintainability || []).slice(0, 2).map(r => r.id),
            ...(categorized.collaboration || []).slice(0, 2).map(r => r.id)
          ],
          estimatedEffort: '1-2 days',
          expectedOutcome: 'Better code organization and team collaboration.'
        },
        {
          name: 'Acceleration: Velocity & Advanced Features',
          recommendations: [
            ...(categorized.velocity || []).slice(0, 2).map(r => r.id),
            ...(categorized.security || []).slice(3, 4).map(r => r.id),
            ...(categorized.reliability || []).slice(2, 3).map(r => r.id)
          ],
          estimatedEffort: '2-3 days',
          expectedOutcome: 'Faster development cycles and advanced GitHub features utilization.'
        }
      ]
    };
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine(); 