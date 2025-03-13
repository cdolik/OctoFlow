/**
 * Repository Health Controller
 * 
 * This controller ties together all the services and provides a unified API
 * for the frontend to interact with the repository health assessment functionality.
 */

import { githubDataService } from '../services/githubDataService';
import { assessmentService, AssessmentResult } from '../services/assessmentService';
import { recommendationEngine, EnhancedAssessmentResult } from '../services/recommendationEngine';
import { githubActionsService, WorkflowTemplate, WorkflowDeploymentResult } from '../services/githubActionsService';
import { visualizationService } from '../services/visualizationService';

/**
 * Repository Health Controller class
 */
export class RepositoryHealthController {
  /**
   * Perform a basic health assessment of a repository
   */
  async assessRepository(owner: string, repo: string): Promise<AssessmentResult> {
    try {
      return await assessmentService.evaluateRepository(owner, repo);
    } catch (error) {
      console.error('Error assessing repository:', error);
      throw new Error(`Failed to assess repository ${owner}/${repo}: ${error.message}`);
    }
  }

  /**
   * Perform an enhanced health assessment with AI-powered recommendations
   */
  async getEnhancedAssessment(owner: string, repo: string): Promise<EnhancedAssessmentResult> {
    try {
      return await recommendationEngine.generateRecommendations(owner, repo);
    } catch (error) {
      console.error('Error generating enhanced assessment:', error);
      throw new Error(`Failed to generate enhanced assessment for ${owner}/${repo}: ${error.message}`);
    }
  }

  /**
   * Get visualization data for repository health
   */
  getVisualizationData(assessmentResult: AssessmentResult) {
    try {
      return {
        radarChart: visualizationService.generateHealthRadarChart(assessmentResult.repositoryInsights),
        scoreCards: visualizationService.generateScoreCards(assessmentResult.repositoryInsights),
        recommendationChart: visualizationService.generateRecommendationChart(assessmentResult)
      };
    } catch (error) {
      console.error('Error generating visualization data:', error);
      throw new Error(`Failed to generate visualization data: ${error.message}`);
    }
  }

  /**
   * Get implementation plan visualization data
   */
  getImplementationPlanVisualization(enhancedResult: EnhancedAssessmentResult) {
    try {
      return visualizationService.generateImplementationPlanVisualization(enhancedResult);
    } catch (error) {
      console.error('Error generating implementation plan visualization:', error);
      throw new Error(`Failed to generate implementation plan visualization: ${error.message}`);
    }
  }

  /**
   * Generate health badges for a repository
   */
  generateHealthBadges(owner: string, repo: string, assessmentResult: AssessmentResult) {
    try {
      return {
        markdown: visualizationService.generateHealthBadgesMarkdown(
          owner,
          repo,
          assessmentResult.repositoryInsights
        ),
        badgeUrls: {
          overall: visualizationService.generateHealthBadgeUrl(
            repo,
            assessmentResult.repositoryInsights.overallScore
          ),
          security: visualizationService.generateHealthBadgeUrl(
            repo,
            assessmentResult.repositoryInsights.security.securityScore,
            'Security'
          ),
          reliability: visualizationService.generateHealthBadgeUrl(
            repo,
            assessmentResult.repositoryInsights.reliability.reliabilityScore,
            'Reliability'
          ),
          maintainability: visualizationService.generateHealthBadgeUrl(
            repo,
            assessmentResult.repositoryInsights.maintainability.maintainabilityScore,
            'Maintainability'
          )
        }
      };
    } catch (error) {
      console.error('Error generating health badges:', error);
      throw new Error(`Failed to generate health badges: ${error.message}`);
    }
  }

  /**
   * Generate embeddable HTML for repository health visualization
   */
  generateEmbeddableHtml(owner: string, repo: string, assessmentResult: AssessmentResult) {
    try {
      return visualizationService.generateEmbeddableHtml(
        owner,
        repo,
        assessmentResult.repositoryInsights
      );
    } catch (error) {
      console.error('Error generating embeddable HTML:', error);
      throw new Error(`Failed to generate embeddable HTML: ${error.message}`);
    }
  }

  /**
   * Get available GitHub Actions workflow templates
   */
  getWorkflowTemplates(): WorkflowTemplate[] {
    try {
      return githubActionsService.getAllWorkflowTemplates();
    } catch (error) {
      console.error('Error getting workflow templates:', error);
      throw new Error(`Failed to get workflow templates: ${error.message}`);
    }
  }

  /**
   * Get workflow templates by category
   */
  getWorkflowTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
    try {
      return githubActionsService.getWorkflowTemplatesByCategory(category);
    } catch (error) {
      console.error(`Error getting workflow templates for category ${category}:`, error);
      throw new Error(`Failed to get workflow templates for category ${category}: ${error.message}`);
    }
  }

  /**
   * Get workflow templates for a specific recommendation
   */
  getWorkflowTemplatesForRecommendation(recommendationId: string): WorkflowTemplate[] {
    try {
      return githubActionsService.getWorkflowTemplatesForRecommendation(recommendationId);
    } catch (error) {
      console.error(`Error getting workflow templates for recommendation ${recommendationId}:`, error);
      throw new Error(`Failed to get workflow templates for recommendation ${recommendationId}: ${error.message}`);
    }
  }

  /**
   * Deploy a workflow to a repository
   */
  async deployWorkflow(
    owner: string,
    repo: string,
    templateId: string,
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> {
    try {
      return await githubActionsService.deployWorkflow(owner, repo, templateId, createPullRequest);
    } catch (error) {
      console.error(`Error deploying workflow ${templateId}:`, error);
      throw new Error(`Failed to deploy workflow ${templateId}: ${error.message}`);
    }
  }

  /**
   * Implement a recommendation using GitHub Actions
   */
  async implementRecommendation(
    owner: string,
    repo: string,
    recommendationId: string,
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> {
    try {
      // Get the assessment result to find the recommendation
      const assessment = await this.assessRepository(owner, repo);
      
      // Find the recommendation
      const recommendation = assessment.recommendations.find(rec => rec.id === recommendationId);
      
      if (!recommendation) {
        throw new Error(`Recommendation with ID "${recommendationId}" not found.`);
      }
      
      // Create a workflow to implement the recommendation
      return await githubActionsService.createWorkflowForRecommendation(
        owner,
        repo,
        recommendation,
        createPullRequest
      );
    } catch (error) {
      console.error(`Error implementing recommendation ${recommendationId}:`, error);
      throw new Error(`Failed to implement recommendation ${recommendationId}: ${error.message}`);
    }
  }

  /**
   * Implement multiple recommendations at once
   */
  async implementMultipleRecommendations(
    owner: string,
    repo: string,
    recommendationIds: string[],
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult[]> {
    try {
      const results: WorkflowDeploymentResult[] = [];
      
      for (const recommendationId of recommendationIds) {
        const result = await this.implementRecommendation(
          owner,
          repo,
          recommendationId,
          createPullRequest
        );
        
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error(`Error implementing multiple recommendations:`, error);
      throw new Error(`Failed to implement multiple recommendations: ${error.message}`);
    }
  }

  /**
   * Save assessment result to history
   */
  saveAssessmentToHistory(owner: string, repo: string, assessment: AssessmentResult): void {
    try {
      // In a real implementation, this would save to a database or localStorage
      // For now, we'll just log it
      console.log(`Saving assessment for ${owner}/${repo} to history`);
      
      // Create a history entry
      const historyEntry = {
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        owner,
        repo,
        overallScore: assessment.repositoryInsights.overallScore,
        categoryScores: {
          security: assessment.repositoryInsights.security.securityScore,
          reliability: assessment.repositoryInsights.reliability.reliabilityScore,
          maintainability: assessment.repositoryInsights.maintainability.maintainabilityScore,
          collaboration: assessment.repositoryInsights.collaboration.collaborationScore,
          velocity: assessment.repositoryInsights.velocity.velocityScore
        },
        recommendations: assessment.recommendations.length,
        quickWins: assessment.quickWins.length
      };
      
      // In a real implementation, save this to localStorage or a database
      console.log('History entry:', historyEntry);
    } catch (error) {
      console.error('Error saving assessment to history:', error);
      // Don't throw here, just log the error
    }
  }

  /**
   * Compare two repositories
   */
  async compareRepositories(
    repo1Owner: string,
    repo1Name: string,
    repo2Owner: string,
    repo2Name: string
  ) {
    try {
      // Get assessments for both repositories
      const assessment1 = await this.assessRepository(repo1Owner, repo1Name);
      const assessment2 = await this.assessRepository(repo2Owner, repo2Name);
      
      // Compare overall scores
      const overallComparison = {
        repo1: {
          name: `${repo1Owner}/${repo1Name}`,
          score: assessment1.repositoryInsights.overallScore
        },
        repo2: {
          name: `${repo2Owner}/${repo2Name}`,
          score: assessment2.repositoryInsights.overallScore
        },
        difference: assessment1.repositoryInsights.overallScore - assessment2.repositoryInsights.overallScore
      };
      
      // Compare category scores
      const categoryComparison = {
        security: {
          repo1: assessment1.repositoryInsights.security.securityScore,
          repo2: assessment2.repositoryInsights.security.securityScore,
          difference: assessment1.repositoryInsights.security.securityScore - assessment2.repositoryInsights.security.securityScore
        },
        reliability: {
          repo1: assessment1.repositoryInsights.reliability.reliabilityScore,
          repo2: assessment2.repositoryInsights.reliability.reliabilityScore,
          difference: assessment1.repositoryInsights.reliability.reliabilityScore - assessment2.repositoryInsights.reliability.reliabilityScore
        },
        maintainability: {
          repo1: assessment1.repositoryInsights.maintainability.maintainabilityScore,
          repo2: assessment2.repositoryInsights.maintainability.maintainabilityScore,
          difference: assessment1.repositoryInsights.maintainability.maintainabilityScore - assessment2.repositoryInsights.maintainability.maintainabilityScore
        },
        collaboration: {
          repo1: assessment1.repositoryInsights.collaboration.collaborationScore,
          repo2: assessment2.repositoryInsights.collaboration.collaborationScore,
          difference: assessment1.repositoryInsights.collaboration.collaborationScore - assessment2.repositoryInsights.collaboration.collaborationScore
        },
        velocity: {
          repo1: assessment1.repositoryInsights.velocity.velocityScore,
          repo2: assessment2.repositoryInsights.velocity.velocityScore,
          difference: assessment1.repositoryInsights.velocity.velocityScore - assessment2.repositoryInsights.velocity.velocityScore
        }
      };
      
      // Compare recommendations
      const recommendationComparison = {
        repo1: {
          total: assessment1.recommendations.length,
          byCategory: this.countRecommendationsByCategory(assessment1.recommendations)
        },
        repo2: {
          total: assessment2.recommendations.length,
          byCategory: this.countRecommendationsByCategory(assessment2.recommendations)
        }
      };
      
      return {
        overallComparison,
        categoryComparison,
        recommendationComparison,
        repo1Assessment: assessment1,
        repo2Assessment: assessment2
      };
    } catch (error) {
      console.error('Error comparing repositories:', error);
      throw new Error(`Failed to compare repositories: ${error.message}`);
    }
  }

  /**
   * Count recommendations by category
   */
  private countRecommendationsByCategory(recommendations: AssessmentResult['recommendations']) {
    return recommendations.reduce((counts, rec) => {
      if (!counts[rec.category]) {
        counts[rec.category] = 0;
      }
      counts[rec.category]++;
      return counts;
    }, {} as Record<string, number>);
  }
}

// Export singleton instance
export const repositoryHealthController = new RepositoryHealthController(); 