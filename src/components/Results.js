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
import { categories } from '../data/questions';
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
  const scores = calculateWeightedScore(responses, stage);
  const recommendations = getRecommendations(scores, stage);
  
  const chartData = {
    labels: Object.values(categories).map(cat => cat.title),
    datasets: [
      {
        label: 'Your Score',
        data: Object.values(categories).map(cat => scores.categoryScores[cat.id] || 0),
        backgroundColor: 'rgba(45, 164, 78, 0.2)',
        borderColor: '#2DA44E',
        borderWidth: 2,
      },
      {
        label: 'Stage Benchmark',
        data: Object.values(categories).map(cat => scores.benchmarks[cat.id] || 0),
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
        suggestedMax: 4,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
            const value = context.raw.toFixed(1);
            return `${label}: ${value}/4.0`;
          }
        }
      }
    }
  };

  const scoreLevel = getScoreLevel(scores.overallScore);

  return (
    <div className="results">
      <div className="score-summary">
        <h2>Your GitHub Engineering Health Score</h2>
        <div className="stage-indicator">
          <span className="stage-badge">{stage.toUpperCase()}</span>
          <span className="stage-benchmark">Benchmark: {scores.benchmarks.overall.toFixed(1)}</span>
        </div>
        <div className="overall-score">
          <span className={`score-number score-level-${scoreLevel.level.toLowerCase()}`}>
            {scores.overallScore.toFixed(1)}
          </span>
          <span className="score-label">
            <h3>{scoreLevel.level}</h3>
            <p>{scoreLevel.description}</p>
          </span>
        </div>
        <div className="completion-rate">
          Assessment Completion: {(scores.completionRate * 100).toFixed(0)}%
        </div>
      </div>

      <div className="score-visualization">
        <h3>Category Performance vs. Benchmarks</h3>
        <Radar data={chartData} options={chartOptions} />
      </div>

      <div className="category-scores">
        <h3>Detailed Category Scores</h3>
        {Object.values(categories).map(category => (
          <div key={category.id} className="category-score">
            <div className="category-header">
              <h4>{category.title}</h4>
              <GitHubTooltip term={category.id}>
                <p className="category-description">{category.description}</p>
              </GitHubTooltip>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${(scores.categoryScores[category.id] || 0) * 25}%`,
                  backgroundColor: (scores.categoryScores[category.id] || 0) >= scores.benchmarks[category.id] 
                    ? '#2DA44E' 
                    : '#FCA000'
                }} 
              />
              <div 
                className="benchmark-marker"
                style={{
                  left: `${scores.benchmarks[category.id] * 25}%`
                }}
              />
            </div>
            <div className="score-details">
              <span className="score-value">
                {scores.categoryScores[category.id]?.toFixed(1) || '0.0'} / 4.0
              </span>
              <span className="benchmark-value">
                Benchmark: {scores.benchmarks[category.id].toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations">
        <h3>Priority Recommendations</h3>
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className="action-card">
              <div className="recommendation-header">
                <h4>{rec.title}</h4>
                <div className="recommendation-meta">
                  <span className={`priority-tag ${rec.priority}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                  <span className="impact">Impact: {rec.impact}</span>
                  <span className="effort">Effort: {rec.effort}</span>
                </div>
              </div>
              <p className="recommendation-details">{rec.details}</p>
              <div className="implementation-steps">
                <h5>Implementation Steps:</h5>
                <ul className="steps-list">
                  {rec.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="recommendation-footer">
                <a 
                  href={rec.resource} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="resource-link"
                >
                  Documentation →
                </a>
                <span className="score-gap">
                  Current: {rec.currentScore.toFixed(1)} → Target: {rec.targetScore.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}