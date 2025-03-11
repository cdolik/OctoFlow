import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../data/questions';

interface ScoresSummaryProps {
  categoryScores: Record<Category, number>;
}

const ScoresSummary: React.FC<ScoresSummaryProps> = ({ categoryScores }) => {
  return (
    <motion.div 
      className="category-scores"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      <h3>Category Scores</h3>
      <div className="score-grid">
        {Object.entries(categoryScores).map(([category, score], index) => (
          <motion.div 
            key={category} 
            className="score-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
          >
            <div className="score-label">{category}</div>
            <div className="score-value">{score.toFixed(1)}</div>
            <div className="score-bar">
              <motion.div 
                className="score-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${(score / 4) * 100}%` }}
                transition={{ delay: 0.5 + (index * 0.1), duration: 0.8, ease: "easeOut" }}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ScoresSummary; 