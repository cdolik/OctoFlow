import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/PRInsightsDashboard.css';
import { fetchPRInsights, PRInsights as ImportedPRInsights } from '../services/insightsService';

// Types for our PR insights data
interface PRRecommendation {
  title: string;
  score: number;
  recommendations: string[];
}

interface PRStats {
  totalAnalyzed: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    needsImprovement: number;
    poor: number;
  };
  recentPRs: PRRecommendation[];
}

interface PRInsights {
  lastUpdated: string;
  prStats: PRStats;
}

const PRInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<PRInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await fetchPRInsights();
        setInsights(data);
        setError(null);
      } catch (err) {
        console.error('Error loading PR insights:', err);
        setError('Failed to load PR insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="pr-insights-loading">
        <h3>Loading PR Insights...</h3>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pr-insights-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="pr-insights-empty">
        <h3>No PR Insights Available</h3>
        <p>Run the analysis pipeline to generate insights.</p>
      </div>
    );
  }

  const { prStats, lastUpdated } = insights;
  const lastUpdatedDate = new Date(lastUpdated).toLocaleString();
  
  // Helper function to get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#2196F3'; // Blue
    if (score >= 50) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className="pr-insights-dashboard">
      <h3 className="insights-tab-header">Pull Request Insights</h3>
      <div className="insights-last-updated">
        Last updated: {lastUpdatedDate}
      </div>

      <div className="dashboard-grid">
        {/* Summary Stats Card */}
        <motion.div 
          className="dashboard-card summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>PR Analysis Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <div className="stat-value">{prStats.totalAnalyzed}</div>
              <div className="stat-label">PRs Analyzed</div>
            </div>
            <div className="stat">
              <div className="stat-value" style={{ color: getScoreColor(prStats.averageScore) }}>
                {Math.round(prStats.averageScore)}
              </div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </motion.div>

        {/* Score Distribution Card */}
        <motion.div 
          className="dashboard-card distribution-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3>Score Distribution</h3>
          <div className="score-distribution">
            <div className="distribution-bar">
              <div className="bar-segment excellent" 
                style={{ 
                  width: `${(prStats.scoreDistribution.excellent / prStats.totalAnalyzed) * 100}%`,
                  display: prStats.scoreDistribution.excellent ? 'block' : 'none'
                }}
              >
                {prStats.scoreDistribution.excellent}
              </div>
              <div className="bar-segment good" 
                style={{ 
                  width: `${(prStats.scoreDistribution.good / prStats.totalAnalyzed) * 100}%`,
                  display: prStats.scoreDistribution.good ? 'block' : 'none'
                }}
              >
                {prStats.scoreDistribution.good}
              </div>
              <div className="bar-segment needs-improvement" 
                style={{ 
                  width: `${(prStats.scoreDistribution.needsImprovement / prStats.totalAnalyzed) * 100}%`,
                  display: prStats.scoreDistribution.needsImprovement ? 'block' : 'none' 
                }}
              >
                {prStats.scoreDistribution.needsImprovement}
              </div>
              <div className="bar-segment poor" 
                style={{ 
                  width: `${(prStats.scoreDistribution.poor / prStats.totalAnalyzed) * 100}%`,
                  display: prStats.scoreDistribution.poor ? 'block' : 'none'
                }}
              >
                {prStats.scoreDistribution.poor}
              </div>
            </div>
            <div className="distribution-legend">
              <div className="legend-item">
                <div className="legend-color excellent"></div>
                <div>Excellent (90-100)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color good"></div>
                <div>Good (70-89)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color needs-improvement"></div>
                <div>Needs Improvement (50-69)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color poor"></div>
                <div>Poor (0-49)</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent PRs Table */}
        <motion.div 
          className="dashboard-card recent-prs-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3>Recent Pull Requests</h3>
          <div className="recent-prs-table">
            <table>
              <thead>
                <tr>
                  <th>PR Title</th>
                  <th>Score</th>
                  <th>Recommendations</th>
                </tr>
              </thead>
              <tbody>
                {prStats.recentPRs.map((pr, index) => (
                  <tr key={index}>
                    <td>{pr.title}</td>
                    <td>
                      <span className="score-pill" style={{ backgroundColor: getScoreColor(pr.score) }}>
                        {pr.score}
                      </span>
                    </td>
                    <td>
                      <ul className="recommendation-list">
                        {pr.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PRInsightsDashboard; 