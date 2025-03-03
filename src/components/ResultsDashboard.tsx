import React, { useState, useEffect } from 'react';
import { StartupStage, Category, calculateCategoryScores, questions } from '../data/questions';

// We'll use React.lazy to load the Chart.js components only when needed
const RadarChart = React.lazy(() => import('./RadarChart'));

interface ResultsDashboardProps {
  stage: StartupStage;
  responses: Record<string, number>;
  onReset: () => void;
}

interface RecommendationItem {
  category: Category;
  text: string;
  docsUrl: string;
  priority: 'high' | 'medium' | 'low';
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ stage, responses, onReset }) => {
  const [categoryScores, setCategoryScores] = useState<Record<Category, number>>({} as Record<Category, number>);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  
  // Calculate scores and generate recommendations when component mounts
  useEffect(() => {
    const scores = calculateCategoryScores(responses);
    setCategoryScores(scores);
    
    // Generate recommendations based on lowest scoring categories
    const lowScoreThreshold = 2.5; // Scores below this will generate recommendations
    const newRecommendations: RecommendationItem[] = [];
    
    // Get low-scoring questions
    const stageQuestionList = questions[stage];
    stageQuestionList.forEach(question => {
      const score = responses[question.id] || 0;
      if (score <= lowScoreThreshold) {
        newRecommendations.push({
          category: question.category,
          text: `Improve: ${question.text}`,
          docsUrl: question.githubDocsUrl,
          priority: score <= 1 ? 'high' : score <= 2 ? 'medium' : 'low'
        });
      }
    });
    
    // Sort by priority
    newRecommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setRecommendations(newRecommendations);
    
    // Simulate chart loading (in a real app, this would be handled by React.Suspense)
    setTimeout(() => setIsChartLoaded(true), 500);
  }, [stage, responses]);
  
  // For the MVP, we'll render a simple placeholder while waiting for Chart.js
  const renderChartPlaceholder = () => (
    <div className="chart-placeholder">
      <p>Loading chart...</p>
    </div>
  );
  
  return (
    <div className="results-dashboard">
      <h2>{stage} Assessment Results</h2>
      
      <div className="results-summary">
        <p>
          Your assessment is complete! See how your GitHub practices measure up and 
          review your recommendations below.
        </p>
      </div>
      
      <div className="results-chart">
        {isChartLoaded ? (
          <React.Suspense fallback={renderChartPlaceholder()}>
            <RadarChart categoryScores={categoryScores} />
          </React.Suspense>
        ) : (
          renderChartPlaceholder()
        )}
      </div>
      
      <div className="category-scores">
        <h3>Category Scores</h3>
        <div className="score-grid">
          {Object.entries(categoryScores).map(([category, score]) => (
            <div key={category} className="score-item">
              <div className="score-label">{category}</div>
              <div className="score-value">{score.toFixed(1)}</div>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${(score / 4) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="recommendations">
        <h3>Recommendations</h3>
        {recommendations.length === 0 ? (
          <p>Great job! You've implemented GitHub best practices effectively.</p>
        ) : (
          <ul className="recommendation-list">
            {recommendations.map((rec, index) => (
              <li key={index} className={`priority-${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-category">{rec.category}</span>
                  <span className="rec-priority">{rec.priority} priority</span>
                </div>
                <div className="rec-text">{rec.text}</div>
                <a href={rec.docsUrl} target="_blank" rel="noopener noreferrer" className="rec-link">
                  GitHub Docs Reference
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="action-buttons">
        <button onClick={onReset} className="primary-button">
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard; 