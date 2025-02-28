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
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { getAssessmentResponses } from '../utils/storage';
import { calculateStageScores, getScoreLevel } from '../utils/scoring';
import { getRecommendations } from '../utils/recommendations';
import { categories } from '../data/categories';
import GitHubTooltip from './GitHubTooltip';
import { trackRecommendationClick } from '../utils/analytics';
import { Stage, ScoreResult, ScoreLevel } from '../types';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';
import { stageConfig } from '../data/StageConfig';
import './styles.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ResultsProps {
  stage: Stage;
  onComplete: () => void;
}

export const Results: React.FC<ResultsProps> = ({ stage }) => {
  const chartRef = useRef<ChartJS<'radar'> | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  
  const responses = useMemo(() => getAssessmentResponses() as Record<string, number>, []);
  const scores = useMemo<ScoreResult>(() => {
    const result = calculateStageScores(stage, responses);
    const level = getScoreLevel(result.overallScore);
    return {
      categoryScores: { ...result.categoryScores },
      gaps: result.gaps || {},
      benchmarks: result.benchmarks || {},
      overallScore: result.overallScore,
      completionRate: result.completionRate || 0,
      level
    };
  }, [responses, stage]);
  
  const recommendations = useMemo(() => getRecommendations(scores, stage), [scores, stage]);
  
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
        label: `${stageConfig[stage]?.label || stage} Benchmark`,
        data: Object.values(categories).map(cat => scores.benchmarks?.[cat.id] || 0),
        backgroundColor: 'rgba(36, 41, 46, 0.1)',
        borderColor: '#24292E',
        borderWidth: 1,
        borderDash: [5, 5]
      }
    ]
  }), [scores, stage]);
  
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
          label: (context: TooltipItem<'radar'>) => {
            const value = typeof context.raw === 'number' ? context.raw : 0;
            return `${context.dataset.label}: ${value.toFixed(1)}/4.0`;
          }
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
  
  const handleClick = useCallback<React.MouseEventHandler<HTMLCanvasElement>>((event) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    );
    if (elements && elements[0]) {
      const { index } = elements[0];
      const categoryId = Object.values(categories)[index]?.id;
      if (categoryId) {
        handleRecommendationClick(`chart_${categoryId}`, categoryId);
      }
    }
  }, [handleRecommendationClick]);
  
  useEffect(() => {
    const chartInstance = chartInstanceRef.current;
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);
  
  if (!scores || !recommendations) {
    return <div className="error-state">Unable to calculate assessment results</div>;
  }
  
  return (
    <AssessmentErrorBoundary stage={stage}>
      <div className="results">
        <div className="score-summary">
          <h2>Your GitHub Engineering Health Score</h2>
          <div className="stage-indicator">
            <span className="stage-badge">{stage.toUpperCase()}</span>
            <span className="stage-benchmark">Benchmark: {(scores.benchmarks?.overall || 0).toFixed(1)}</span>
          </div>
          <div className="overall-score">
            <span className={`score-number score-level-${scores.level?.toLowerCase()}`}>
              {scores.overallScore.toFixed(1)}
            </span>
            <span className="score-label">
              <h3>{scores.level}</h3>
              <p>{getScoreDescription(scores.level)}</p>
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
              onClick={handleClick}
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
                    backgroundColor: (scores.categoryScores[category.id] || 0) >= (scores.benchmarks?.[category.id] || 0) 
                      ? '#2DA44E' 
                      : '#FCA000'
                  }} 
                />
                <div 
                  className="benchmark-marker"
                  style={{
                    left: `${(scores.benchmarks?.[category.id] || 0) * 25}%`
                  }}
                />
              </div>
              <div className="score-details">
                <span className="score-value">
                  {scores.categoryScores[category.id]?.toFixed(1) || '0.0'} / 4.0
                </span>
                <span className="benchmark-value">
                  Benchmark: {(scores.benchmarks?.[category.id] || 0).toFixed(1)}
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
                    <span className={`priority-tag ${getPriorityClass(rec.impact)}`}>
                      {getPriorityText(rec.impact)}
                    </span>
                    <span className="impact">Impact: {rec.impact}</span>
                    <span className="effort">Effort: {rec.effort}</span>
                  </div>
                </div>
                <p className="recommendation-details">{rec.details || rec.description}</p>
                {rec.steps && (
                  <div className="implementation-steps">
                    <h5>Implementation Steps:</h5>
                    <ul className="steps-list">
                      {rec.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="recommendation-footer">
                  {rec.resource && (
                    <a 
                      href={rec.resource} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="resource-link"
                    >
                      Documentation →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="survey-container" style={{ marginTop: '2rem' }}>
          <p>Help us improve by completing our brief survey:</p>
          <a
            href="https://forms.gle/your-google-form-url"
            target="_blank"
            rel="noopener noreferrer"
            className="survey-link"
          >
            Complete Survey
          </a>
        </div>
      </div>
    </AssessmentErrorBoundary>
  );
};

function getScoreDescription(level: ScoreLevel): string {
  switch(level) {
    case 'High':
      return 'Excellent engineering practices';
    case 'Medium':
      return 'Good progress with room for improvement';
    case 'Low':
      return 'Significant improvement opportunities';
    default:
      return 'Assessment results';
  }
}

function getPriorityClass(impact: number): string {
  if (impact >= 8) return 'high';
  if (impact >= 5) return 'medium';
  return 'low';
}

function getPriorityText(impact: number): string {
  if (impact >= 8) return 'HIGH';
  if (impact >= 5) return 'MEDIUM';
  return 'LOW';
}

export default Results;
