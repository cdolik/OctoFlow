/**
 * Script to update the summary data file from raw and insights data
 */

import fs from 'fs';
import path from 'path';

const updateSummary = () => {
  const summaryFile = path.join('data', 'summary.json');
  const insightsDir = path.join('data', 'insights');

  const summary = {
    lastUpdated: new Date().toISOString(),
    prStats: {
      totalAnalyzed: 0,
      averageScore: 0,
      scoreDistribution: {
        excellent: 0,
        good: 0,
        needsImprovement: 0,
        poor: 0
      },
      recentPRs: []
    }
  };

  // Load existing summary if available
  if (fs.existsSync(summaryFile)) {
    try {
      const existingSummary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
      Object.assign(summary, existingSummary, { lastUpdated: summary.lastUpdated });
    } catch (error) {
      console.error('Error reading existing summary:', error);
    }
  }

  // Get latest insights folder
  const insightFolders = fs.existsSync(insightsDir)
    ? fs.readdirSync(insightsDir).filter(f => fs.statSync(path.join(insightsDir, f)).isDirectory())
    : [];

  if (insightFolders.length > 0) {
    insightFolders.sort().reverse();
    const latestFolder = insightFolders[0];
    const insightFile = path.join(insightsDir, latestFolder, 'pr-insights.json');

    if (fs.existsSync(insightFile)) {
      try {
        // Read the insights file directly
        const fileContent = fs.readFileSync(insightFile, 'utf8');
        
        // Try to parse as JSON, handling any potential issues
        let insights;
        try {
          insights = JSON.parse(fileContent);
        } catch (parseError) {
          console.error('Error parsing insights as JSON, trying to clean the file content');
          
          // Attempt to clean up the file content
          const cleanedContent = fileContent
            .replace(/^[^[{]*/, '') // Remove anything before the first [ or {
            .replace(/[^}\]]*$/, ''); // Remove anything after the last } or ]
          
          try {
            insights = JSON.parse(cleanedContent);
          } catch (cleanParseError) {
            console.error('Error parsing cleaned insights:', cleanParseError);
            return; // Exit the function if we can't parse the data
          }
        }

        // Verify we have valid insights data
        if (!Array.isArray(insights)) {
          console.error('Insights data is not an array');
          return;
        }

        summary.prStats.totalAnalyzed = insights.length;

        let scoreSum = 0;
        summary.prStats.scoreDistribution = { excellent: 0, good: 0, needsImprovement: 0, poor: 0 };

        insights.forEach(insight => {
          const score = insight.analysis.score || 0;
          scoreSum += score;

          if (score >= 90) summary.prStats.scoreDistribution.excellent++;
          else if (score >= 70) summary.prStats.scoreDistribution.good++;
          else if (score >= 50) summary.prStats.scoreDistribution.needsImprovement++;
          else summary.prStats.scoreDistribution.poor++;
        });

        // Update average score if we have any PRs analyzed
        if (insights.length > 0) {
          summary.prStats.averageScore = scoreSum / insights.length;
        }

        // Update recent PRs
        summary.prStats.recentPRs = insights.slice(0, 5).map(insight => ({
          title: insight.prTitle,
          score: insight.analysis.score,
          recommendations: insight.analysis.recommendations
        }));

      } catch (error) {
        console.error('Error processing insights:', error);
      }
    }
  }

  // Write updated summary
  try {
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log('Summary updated successfully');
  } catch (error) {
    console.error('Error writing summary:', error);
  }
};

updateSummary();