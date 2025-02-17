import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { getAssessmentResponses } from '../utils/storage';
import { calculateWeightedScore, getScoreLevel, getRecommendations } from '../utils/scoring';
import { categories } from '../data/categories';
import GitHubTooltip from './GitHubTooltip';
import './styles.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Results({ stage }) {
  const responses = getAssessmentResponses();
  const scores = calculateWeightedScore(responses, categories);
  const recommendations = getRecommendations(scores, stage);
  
  const chartData = {
    labels: categories.map(cat => cat.title),
    datasets: [
      {
        label: 'Your Score',
        data: categories.map(cat => scores.categoryScores[cat.id] || 0),
        backgroundColor: 'rgba(45, 164, 78, 0.2)',
        borderColor: '#2DA44E',
        borderWidth: 2,
      },
      {
        label: 'Industry Average',
        data: categories.map(() => 3.2), // Example benchmark
        backgroundColor: 'rgba(36, 41, 46, 0.1)',
        borderColor: '#24292E',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 4
      }
    }
  };

  return (
    <div className="results">
      <div className="score-summary">
        <h2>Your GitHub Engineering Health Score</h2>
        <div className="overall-score">
          <span className="score-number">{scores.overallScore.toFixed(1)}</span>
          <span className="score-label">{getScoreLevel(scores.overallScore)}</span>
        </div>
        <div className="completion-rate">
          Assessment Completion: {(scores.completionRate * 100).toFixed(0)}%
        </div>
      </div>

      <div className="score-visualization">
        <Radar data={chartData} options={chartOptions} />
      </div>

      <div className="category-scores">
        {categories.map(category => (
          <div key={category.id} className="category-score">
            <h3>{category.title}</h3>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${(scores.categoryScores[category.id] || 0) * 25}%`,
                  backgroundColor: scores.categoryScores[category.id] >= 3 ? '#2DA44E' : '#FCA000'
                }} 
              />
            </div>
            <span className="score-value">
              {scores.categoryScores[category.id]?.toFixed(1) || '0.0'} / 4.0
            </span>
          </div>
        ))}
      </div>

      <div className="recommendations">
        <h3>Priority Recommendations</h3>
        {recommendations.map((rec, index) => (
          <div key={index} className="action-card">
            <GitHubTooltip term={rec.category}>
              <h4>{categories.find(c => c.id === rec.category)?.title}</h4>
            </GitHubTooltip>
            <ul className="action-list">
              {rec.actions.map((action, actionIndex) => (
                <li key={actionIndex}>{action}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}