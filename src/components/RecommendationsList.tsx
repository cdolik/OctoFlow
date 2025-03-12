import React from 'react';
import { Category } from '../data/questions';

interface RecommendationsListProps {
  recommendations: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="recommendations-list empty">
        <h3>Recommendations</h3>
        <p>Great job! No recommendations at this time.</p>
      </div>
    );
  }

  // Group recommendations by priority
  const highPriority = recommendations.filter(rec => rec.priority === 'high');
  const mediumPriority = recommendations.filter(rec => rec.priority === 'medium');
  const lowPriority = recommendations.filter(rec => rec.priority === 'low');

  return (
    <div className="recommendations-list">
      <h3>Recommendations</h3>
      
      {highPriority.length > 0 && (
        <div className="priority-group high">
          <h4>High Priority</h4>
          <ul>
            {highPriority.map((rec, index) => (
              <li key={index}>
                <span className="recommendation-text">{rec.text}</span>
                <a href={rec.docsUrl} target="_blank" rel="noopener noreferrer" className="docs-link">
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {mediumPriority.length > 0 && (
        <div className="priority-group medium">
          <h4>Medium Priority</h4>
          <ul>
            {mediumPriority.map((rec, index) => (
              <li key={index}>
                <span className="recommendation-text">{rec.text}</span>
                <a href={rec.docsUrl} target="_blank" rel="noopener noreferrer" className="docs-link">
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {lowPriority.length > 0 && (
        <div className="priority-group low">
          <h4>Low Priority</h4>
          <ul>
            {lowPriority.map((rec, index) => (
              <li key={index}>
                <span className="recommendation-text">{rec.text}</span>
                <a href={rec.docsUrl} target="_blank" rel="noopener noreferrer" className="docs-link">
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecommendationsList; 