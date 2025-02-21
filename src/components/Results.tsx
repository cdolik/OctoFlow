import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { getAssessmentResponses } from '../utils/storage';
import { calculateWeightedScore, getScoreLevel, getRecommendations } from '../utils/scoring';
import { categories } from '../data/categories';
import GitHubTooltip from './GitHubTooltip';
import { trackRecommendationClick } from '../utils/analytics';
import './styles.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CategoryScores {
  [key: string]: number;
}

interface Benchmarks {
  [key: string]: number;
  overall: number;
}

interface ScoreResult {
  categoryScores: CategoryScores;
  overallScore: number;
  benchmarks: Benchmarks;
  completionRate: number;
  gaps: Record<string, number>;
}

interface ScoreLevel {
  level: string;
  description: string;
}

interface Recommendation {
  id: string;
  category: string;
  title: string;
  details: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
  steps: string[];
  resource: string;
  currentScore: number;
  targetScore: number;
}

interface Stage {
  id: string;
  label: string;
  toUpperCase: () => string;
  benchmarks: Record<string, any>;
}

interface ResultsProps {
  stage: Stage;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export const Results: React.FC<ResultsProps> = ({ stage }) => {
  const chartRef = useRef<any>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  
  const responses = useMemo(() => getAssessmentResponses(), []);
  const scores = useMemo<ScoreResult>(() => calculateWeightedScore(responses, stage.id), [responses, stage]);
  const recommendations = useMemo<Recommendation[]>(() => getRecommendations(scores, stage.id), [scores, stage]);
  const scoreLevel = useMemo<ScoreLevel>(() => getScoreLevel(scores.overallScore), [scores.overallScore]);

  const chartData = useMemo<ChartData<'radar'>>(() => ({
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
  }), [scores]);

  const chartOptions = useMemo<ChartOptions<'radar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 4,
        ticks: { stepSize: 1 }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}/4.0`
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  }), []);

  const handleRecommendationClick = useCallback((recId: string, category: string) => {
    trackRecommendationClick(recId, category);
  }, []);

  // Chart cleanup and instance management
  useEffect(() => {
    const chartInstance = chartInstanceRef.current;
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  // Render prevention for invalid state
  if (!scores || !recommendations) {
    return <div className="error-state">Unable to calculate assessment results</div>;
  }

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
        <div style={{ height: '400px', width: '100%' }}>
          <Radar 
            ref={chartRef}
            data={chartData}
            options={chartOptions}
            onClick={(event, elements) => {
              if (elements && elements[0]) {
                const categoryIndex = elements[0].index;
                const categoryId = Object.values(categories)[categoryIndex]?.id;
                if (categoryId) {
                  handleRecommendationClick(`chart_${categoryId}`, categoryId);
                }
              }
            }}
          />
        </div>
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
            <div key={index} className="action-card" onClick={() => handleRecommendationClick(rec.id, rec.category)}>
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
};

export default Results;