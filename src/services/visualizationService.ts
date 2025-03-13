/**
 * Visualization Service
 * 
 * This service generates charts and visualizations for repository health assessments.
 * It provides methods to create radar charts, score cards, trend charts, and other
 * visualizations to help users understand their repository health.
 */

import { RepositoryHealthInsights } from './githubDataService';
import { AssessmentResult } from './assessmentService';
import { EnhancedAssessmentResult } from './recommendationEngine';

// Define chart data interfaces
export interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface ScoreCardData {
  title: string;
  score: number;
  color: string;
  icon: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
  };
}

export interface TrendChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

export interface RecommendationChartData {
  categories: {
    name: string;
    count: number;
    color: string;
  }[];
  impact: {
    high: number;
    medium: number;
    low: number;
  };
  effort: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Visualization Service class
 */
export class VisualizationService {
  /**
   * Generate radar chart data for repository health
   */
  generateHealthRadarChart(insights: RepositoryHealthInsights): RadarChartData {
    return {
      labels: [
        'Security',
        'Reliability',
        'Maintainability',
        'Collaboration',
        'Velocity'
      ],
      datasets: [
        {
          label: 'Repository Health',
          data: [
            insights.security.securityScore,
            insights.reliability.reliabilityScore,
            insights.maintainability.maintainabilityScore,
            insights.collaboration.collaborationScore,
            insights.velocity.velocityScore
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }
      ]
    };
  }

  /**
   * Generate score cards for each category
   */
  generateScoreCards(insights: RepositoryHealthInsights): ScoreCardData[] {
    return [
      {
        title: 'Overall Health',
        score: insights.overallScore,
        color: this.getScoreColor(insights.overallScore),
        icon: 'chart-line',
        trend: {
          direction: 'up',
          value: 5
        }
      },
      {
        title: 'Security',
        score: insights.security.securityScore,
        color: this.getScoreColor(insights.security.securityScore),
        icon: 'shield-alt',
        trend: {
          direction: this.getTrendDirection(insights.security.securityScore, 65),
          value: Math.abs(insights.security.securityScore - 65)
        }
      },
      {
        title: 'Reliability',
        score: insights.reliability.reliabilityScore,
        color: this.getScoreColor(insights.reliability.reliabilityScore),
        icon: 'heartbeat',
        trend: {
          direction: this.getTrendDirection(insights.reliability.reliabilityScore, 70),
          value: Math.abs(insights.reliability.reliabilityScore - 70)
        }
      },
      {
        title: 'Maintainability',
        score: insights.maintainability.maintainabilityScore,
        color: this.getScoreColor(insights.maintainability.maintainabilityScore),
        icon: 'tools',
        trend: {
          direction: this.getTrendDirection(insights.maintainability.maintainabilityScore, 60),
          value: Math.abs(insights.maintainability.maintainabilityScore - 60)
        }
      },
      {
        title: 'Collaboration',
        score: insights.collaboration.collaborationScore,
        color: this.getScoreColor(insights.collaboration.collaborationScore),
        icon: 'users',
        trend: {
          direction: this.getTrendDirection(insights.collaboration.collaborationScore, 75),
          value: Math.abs(insights.collaboration.collaborationScore - 75)
        }
      },
      {
        title: 'Velocity',
        score: insights.velocity.velocityScore,
        color: this.getScoreColor(insights.velocity.velocityScore),
        icon: 'tachometer-alt',
        trend: {
          direction: this.getTrendDirection(insights.velocity.velocityScore, 68),
          value: Math.abs(insights.velocity.velocityScore - 68)
        }
      }
    ];
  }

  /**
   * Generate trend chart data for repository health over time
   */
  generateTrendChart(
    repositoryName: string,
    dates: string[],
    scores: number[]
  ): TrendChartData {
    return {
      labels: dates,
      datasets: [
        {
          label: `${repositoryName} Health Score`,
          data: scores,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true
        }
      ]
    };
  }

  /**
   * Generate recommendation chart data
   */
  generateRecommendationChart(assessmentResult: AssessmentResult): RecommendationChartData {
    // Count recommendations by category
    const categoryCount: Record<string, number> = {};
    const impactCount = { high: 0, medium: 0, low: 0 };
    const effortCount = { high: 0, medium: 0, low: 0 };
    
    assessmentResult.recommendations.forEach(rec => {
      // Count by category
      if (!categoryCount[rec.category]) {
        categoryCount[rec.category] = 0;
      }
      categoryCount[rec.category]++;
      
      // Count by impact
      impactCount[rec.impact]++;
      
      // Count by effort
      effortCount[rec.effort]++;
    });
    
    // Convert category counts to chart data
    const categoryColors: Record<string, string> = {
      security: '#FF6384',
      reliability: '#36A2EB',
      maintainability: '#FFCE56',
      collaboration: '#4BC0C0',
      velocity: '#9966FF'
    };
    
    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      color: categoryColors[name] || '#CCCCCC'
    }));
    
    return {
      categories,
      impact: impactCount,
      effort: effortCount
    };
  }

  /**
   * Generate implementation plan visualization data
   */
  generateImplementationPlanVisualization(
    enhancedResult: EnhancedAssessmentResult
  ): any {
    // This would generate data for visualizing the implementation plan
    // For now, we'll return a simplified version
    
    const plan = enhancedResult.implementationPlan;
    
    return {
      title: plan.title,
      description: plan.description,
      phases: plan.steps.map(step => ({
        name: step.name,
        recommendationCount: step.recommendations.length,
        effort: step.estimatedEffort,
        outcome: step.expectedOutcome
      }))
    };
  }

  /**
   * Get color based on score
   */
  private getScoreColor(score: number): string {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  /**
   * Get trend direction based on current and previous scores
   */
  private getTrendDirection(
    currentScore: number,
    previousScore: number
  ): 'up' | 'down' | 'neutral' {
    const difference = currentScore - previousScore;
    if (difference > 1) return 'up';
    if (difference < -1) return 'down';
    return 'neutral';
  }

  /**
   * Generate badge URL for repository health
   */
  generateHealthBadgeUrl(
    repositoryName: string,
    score: number,
    category?: string
  ): string {
    const label = category 
      ? `${category} Score`
      : 'Health Score';
    
    const color = this.getBadgeColor(score);
    
    return `https://img.shields.io/badge/${encodeURIComponent(label)}-${score}%25-${color}`;
  }

  /**
   * Get badge color based on score
   */
  private getBadgeColor(score: number): string {
    if (score >= 80) return 'brightgreen';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }

  /**
   * Generate markdown for repository health badges
   */
  generateHealthBadgesMarkdown(
    owner: string,
    repo: string,
    insights: RepositoryHealthInsights
  ): string {
    const overallBadge = this.generateHealthBadgeUrl(repo, insights.overallScore);
    const securityBadge = this.generateHealthBadgeUrl(repo, insights.security.securityScore, 'Security');
    const reliabilityBadge = this.generateHealthBadgeUrl(repo, insights.reliability.reliabilityScore, 'Reliability');
    const maintainabilityBadge = this.generateHealthBadgeUrl(repo, insights.maintainability.maintainabilityScore, 'Maintainability');
    
    return `# GitHub Health Badges for ${owner}/${repo}

![Overall Health](${overallBadge})
![Security Score](${securityBadge})
![Reliability Score](${reliabilityBadge})
![Maintainability Score](${maintainabilityBadge})

These badges are generated by [OctoFlow](https://github.com/octoflow/octoflow) based on the GitHub Well-Architected Framework.`;
  }

  /**
   * Generate HTML for embedding repository health visualization
   */
  generateEmbeddableHtml(
    owner: string,
    repo: string,
    insights: RepositoryHealthInsights
  ): string {
    // This would generate embeddable HTML for the repository health visualization
    // For now, we'll return a simplified version
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GitHub Health for ${owner}/${repo}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .score-card { 
      display: inline-block; 
      width: 150px; 
      padding: 15px; 
      margin: 10px; 
      text-align: center; 
      border-radius: 5px; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
    }
    .score { font-size: 24px; font-weight: bold; }
    .chart-container { margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GitHub Health Dashboard</h1>
      <p>${owner}/${repo}</p>
    </div>
    
    <div class="score-cards">
      <div class="score-card" style="background-color: ${this.getScoreColor(insights.overallScore)}20; border: 1px solid ${this.getScoreColor(insights.overallScore)};">
        <div>Overall Health</div>
        <div class="score">${insights.overallScore}%</div>
      </div>
      <div class="score-card" style="background-color: ${this.getScoreColor(insights.security.securityScore)}20; border: 1px solid ${this.getScoreColor(insights.security.securityScore)};">
        <div>Security</div>
        <div class="score">${insights.security.securityScore}%</div>
      </div>
      <div class="score-card" style="background-color: ${this.getScoreColor(insights.reliability.reliabilityScore)}20; border: 1px solid ${this.getScoreColor(insights.reliability.reliabilityScore)};">
        <div>Reliability</div>
        <div class="score">${insights.reliability.reliabilityScore}%</div>
      </div>
      <div class="score-card" style="background-color: ${this.getScoreColor(insights.maintainability.maintainabilityScore)}20; border: 1px solid ${this.getScoreColor(insights.maintainability.maintainabilityScore)};">
        <div>Maintainability</div>
        <div class="score">${insights.maintainability.maintainabilityScore}%</div>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas id="radarChart"></canvas>
    </div>
  </div>
  
  <script>
    // Radar chart data
    const radarData = {
      labels: ['Security', 'Reliability', 'Maintainability', 'Collaboration', 'Velocity'],
      datasets: [{
        label: 'Repository Health',
        data: [
          ${insights.security.securityScore},
          ${insights.reliability.reliabilityScore},
          ${insights.maintainability.maintainabilityScore},
          ${insights.collaboration.collaborationScore},
          ${insights.velocity.velocityScore}
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };
    
    // Create radar chart
    const radarChart = new Chart(
      document.getElementById('radarChart'),
      {
        type: 'radar',
        data: radarData,
        options: {
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          }
        }
      }
    );
  </script>
</body>
</html>`;
  }
}

// Export singleton instance
export const visualizationService = new VisualizationService(); 