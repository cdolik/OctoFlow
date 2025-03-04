import React from 'react';
import { motion } from 'framer-motion';
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
  return (
    <motion.div 
      className="recommendations"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
    >
      <h3>Recommendations</h3>
      {recommendations.length === 0 ? (
        <p>Great job! You&apos;ve implemented GitHub best practices effectively.</p>
      ) : (
        <ul className="recommendation-list">
          {recommendations.map((rec, index) => (
            <motion.li 
              key={index} 
              className={`priority-${rec.priority}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
            >
              <div className="rec-header">
                <span className="rec-category">{rec.category}</span>
                <span className="rec-priority">{rec.priority} priority</span>
              </div>
              <div className="rec-text">{rec.text}</div>
              <a href={rec.docsUrl} target="_blank" rel="noopener noreferrer" className="rec-link">
                GitHub Docs Reference
              </a>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default RecommendationsList; 