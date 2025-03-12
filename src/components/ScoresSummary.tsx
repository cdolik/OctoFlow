import React from 'react';
import { Category } from '../data/questions';

interface ScoresSummaryProps {
  categoryScores: Record<Category, number>;
}

const ScoresSummary: React.FC<ScoresSummaryProps> = ({ categoryScores }) => {
  // Helper function to get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 3.5) return '#4CAF50'; // Green
    if (score >= 2.5) return '#2196F3'; // Blue
    if (score >= 1.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className="scores-summary">
      <h3>Category Scores</h3>
      <div className="category-scores-grid">
        {Object.entries(categoryScores).map(([category, score]) => (
          <div key={category} className="category-score-card">
            <div className="category-name">{category}</div>
            <div 
              className="category-score" 
              style={{ color: getScoreColor(score) }}
            >
              {score.toFixed(1)}
            </div>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${(score / 4) * 100}%`,
                  backgroundColor: getScoreColor(score)
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoresSummary; 