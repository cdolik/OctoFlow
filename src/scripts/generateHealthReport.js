/**
 * Script to generate a comprehensive GitHub Health Report for startups
 * This report focuses on metrics that matter for startup engineering teams
 * Usage: node generateHealthReport.js
 */

import fs from 'fs';
import path from 'path';

// Categories based on GitHub's Well-Architected Framework
const CATEGORIES = {
  FUNDAMENTALS: 'GitHub Fundamentals',
  COLLABORATION: 'Code Collaboration & Quality',
  VELOCITY: 'Engineering Velocity'
};

const main = async () => {
  try {
    // Read the latest PR insights
    const today = new Date().toISOString().split('T')[0];
    const insightsDir = path.join('data', 'insights', today);
    
    if (!fs.existsSync(insightsDir)) {
      console.error(`No insights found for today (${today})`);
      process.exit(1);
    }
    
    const insightsFile = path.join(insightsDir, 'pr-insights.json');
    
    if (!fs.existsSync(insightsFile)) {
      console.error(`Insights file not found: ${insightsFile}`);
      process.exit(1);
    }
    
    const insights = JSON.parse(fs.readFileSync(insightsFile, 'utf8'));
    
    // Read summary data
    const summaryFile = path.join('data', 'summary.json');
    let summary = {};
    
    if (fs.existsSync(summaryFile)) {
      summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    }
    
    // Calculate metrics for the health report
    const metrics = calculateStartupMetrics(insights, summary);
    
    // Generate the health report
    const report = generateHealthReport(metrics);
    
    // Write the report to a file
    const reportDir = path.join('data', 'reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    
    const reportFile = path.join(reportDir, `health-report-${today}.md`);
    fs.writeFileSync(reportFile, report);
    
    // Also save as latest report
    const latestReportFile = path.join(reportDir, 'latest-health-report.md');
    fs.writeFileSync(latestReportFile, report);
    
    console.log(`GitHub Health Report saved to ${reportFile}`);
    
    // Save metrics data for the dashboard
    const metricsFile = path.join(reportDir, `health-metrics-${today}.json`);
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
    
    const latestMetricsFile = path.join(reportDir, 'latest-health-metrics.json');
    fs.writeFileSync(latestMetricsFile, JSON.stringify(metrics, null, 2));
    
    console.log(`GitHub Health Metrics saved to ${metricsFile}`);
  } catch (error) {
    console.error('Error generating health report:', error);
    process.exit(1);
  }
};

/**
 * Calculate startup-focused metrics from PR insights
 */
function calculateStartupMetrics(insights, summary) {
  // Extract PRs from insights
  const prs = insights.map(insight => ({
    title: insight.prTitle,
    score: insight.analysis.score || 0,
    recommendations: insight.analysis.recommendations || [],
    strengths: insight.analysis.strengths || [],
    ratings: insight.analysis.ratings || {}
  }));
  
  // Calculate overall health score (0-100)
  const avgScore = prs.length > 0 
    ? prs.reduce((sum, pr) => sum + pr.score, 0) / prs.length * 10 
    : 0;
  
  // Calculate category scores
  const fundamentalsScore = calculateFundamentalsScore(prs, summary);
  const collaborationScore = calculateCollaborationScore(prs, summary);
  const velocityScore = calculateVelocityScore(prs, summary);
  
  // Calculate investor readiness score (weighted average of category scores)
  const investorReadinessScore = (
    fundamentalsScore * 0.3 + 
    collaborationScore * 0.4 + 
    velocityScore * 0.3
  );
  
  // Get top recommendations by category
  const topRecommendations = {
    [CATEGORIES.FUNDAMENTALS]: getTopRecommendationsByCategory(prs, 'fundamentals'),
    [CATEGORIES.COLLABORATION]: getTopRecommendationsByCategory(prs, 'collaboration'),
    [CATEGORIES.VELOCITY]: getTopRecommendationsByCategory(prs, 'velocity')
  };
  
  // Get top strengths by category
  const topStrengths = {
    [CATEGORIES.FUNDAMENTALS]: getTopStrengthsByCategory(prs, 'fundamentals'),
    [CATEGORIES.COLLABORATION]: getTopStrengthsByCategory(prs, 'collaboration'),
    [CATEGORIES.VELOCITY]: getTopStrengthsByCategory(prs, 'velocity')
  };
  
  return {
    date: new Date().toISOString(),
    overallHealthScore: Math.round(avgScore),
    investorReadinessScore: Math.round(investorReadinessScore),
    categoryScores: {
      [CATEGORIES.FUNDAMENTALS]: Math.round(fundamentalsScore),
      [CATEGORIES.COLLABORATION]: Math.round(collaborationScore),
      [CATEGORIES.VELOCITY]: Math.round(velocityScore)
    },
    topRecommendations,
    topStrengths,
    analyzedPRs: prs.length,
    summary: {
      totalAnalyzedPRs: summary.totalAnalyzedPRs || 0,
      averageScore: summary.averageScore || 0,
      scoreDistribution: summary.scoreDistribution || {}
    }
  };
}

/**
 * Calculate GitHub Fundamentals score (0-100)
 * Focuses on repo structure, PR templates, branch management
 */
function calculateFundamentalsScore(prs, summary) {
  // For MVP, use a simplified calculation based on PR scores
  // In a real implementation, this would analyze repo structure, templates, etc.
  const baseScore = prs.length > 0 
    ? prs.reduce((sum, pr) => sum + (pr.ratings.titleQuality || 0) + (pr.ratings.descriptionQuality || 0), 0) / (prs.length * 2) * 100
    : 50; // Default score if no PRs
  
  // Adjust score based on summary data
  const adjustedScore = Math.min(100, Math.max(0, baseScore));
  
  return adjustedScore;
}

/**
 * Calculate Code Collaboration & Quality score (0-100)
 * Focuses on PR reviews, PR size, linked issues
 */
function calculateCollaborationScore(prs, summary) {
  // For MVP, use a simplified calculation based on PR scores
  // In a real implementation, this would analyze review patterns, PR sizes, etc.
  const baseScore = prs.length > 0 
    ? prs.reduce((sum, pr) => sum + (pr.ratings.reviewQuality || 0) + (pr.ratings.sizeComplexity || 0), 0) / (prs.length * 2) * 100
    : 50; // Default score if no PRs
  
  // Adjust score based on summary data
  const adjustedScore = Math.min(100, Math.max(0, baseScore));
  
  return adjustedScore;
}

/**
 * Calculate Engineering Velocity score (0-100)
 * Focuses on time to review, time to merge, reversion rate
 */
function calculateVelocityScore(prs, summary) {
  // For MVP, use a simplified calculation based on PR scores
  // In a real implementation, this would analyze time metrics
  const baseScore = prs.length > 0 
    ? prs.reduce((sum, pr) => sum + pr.score, 0) / prs.length * 10
    : 50; // Default score if no PRs
  
  // Adjust score based on summary data
  const adjustedScore = Math.min(100, Math.max(0, baseScore));
  
  return adjustedScore;
}

/**
 * Get top recommendations by category
 */
function getTopRecommendationsByCategory(prs, category) {
  // For MVP, just return all recommendations
  // In a real implementation, this would filter by category and prioritize
  const allRecommendations = prs.flatMap(pr => pr.recommendations);
  const uniqueRecommendations = [...new Set(allRecommendations)];
  return uniqueRecommendations.slice(0, 3); // Return top 3
}

/**
 * Get top strengths by category
 */
function getTopStrengthsByCategory(prs, category) {
  // For MVP, just return all strengths
  // In a real implementation, this would filter by category and prioritize
  const allStrengths = prs.flatMap(pr => pr.strengths);
  const uniqueStrengths = [...new Set(allStrengths)];
  return uniqueStrengths.slice(0, 3); // Return top 3
}

/**
 * Generate a markdown health report from metrics
 */
function generateHealthReport(metrics) {
  const {
    date,
    overallHealthScore,
    investorReadinessScore,
    categoryScores,
    topRecommendations,
    topStrengths,
    analyzedPRs
  } = metrics;
  
  const reportDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get score emoji
  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '✅';
    if (score >= 40) return '⚠️';
    return '❌';
  };
  
  // Generate the report
  let report = `# 🚀 OctoFlow GitHub Health Report\n\n`;
  report += `## Executive Summary\n\n`;
  report += `**Report Date:** ${reportDate}\n\n`;
  report += `**PRs Analyzed:** ${analyzedPRs}\n\n`;
  
  // Investor Readiness Score
  report += `## 💼 Investor Readiness Score\n\n`;
  report += `${getScoreEmoji(investorReadinessScore)} **${investorReadinessScore}/100**\n\n`;
  report += `*This score indicates how well your GitHub practices align with what investors look for in startup engineering teams.*\n\n`;
  
  // Overall Health Score
  report += `## 🏥 Overall GitHub Health\n\n`;
  report += `${getScoreEmoji(overallHealthScore)} **${overallHealthScore}/100**\n\n`;
  
  // Category Scores
  report += `## 📊 Category Scores\n\n`;
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    report += `### ${getScoreEmoji(score)} ${category}: ${score}/100\n\n`;
    
    // Add recommendations for this category
    report += `#### Recommendations:\n\n`;
    if (topRecommendations[category] && topRecommendations[category].length > 0) {
      topRecommendations[category].forEach(rec => {
        report += `- ${rec}\n`;
      });
    } else {
      report += `- No specific recommendations for this category.\n`;
    }
    
    report += `\n#### Strengths:\n\n`;
    if (topStrengths[category] && topStrengths[category].length > 0) {
      topStrengths[category].forEach(strength => {
        report += `- ${strength}\n`;
      });
    } else {
      report += `- No specific strengths identified for this category.\n`;
    }
    
    report += `\n`;
  });
  
  // Next Steps
  report += `## 🚀 Next Steps for Your Startup\n\n`;
  report += `1. **Focus on your lowest-scoring category first** - This will give you the biggest improvement in your overall score.\n`;
  report += `2. **Implement the top recommendations** - These are tailored to your specific GitHub practices.\n`;
  report += `3. **Re-run this analysis weekly** - Track your progress over time.\n\n`;
  
  // Footer
  report += `---\n\n`;
  report += `*This report was generated by [OctoFlow](https://github.com/cdolik/OctoFlow), an AI-powered GitHub productivity tool for startups.*\n`;
  report += `*Based on GitHub's Well-Architected Framework and startup best practices.*\n`;
  
  return report;
}

main(); 