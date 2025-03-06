import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../data/questions';

interface MaturityScoreCardProps {
  categoryScores: Record<Category, number>;
}

const MaturityScoreCard: React.FC<MaturityScoreCardProps> = ({ categoryScores }) => {
  // Calculate overall maturity score
  const calculateOverallScore = (): number => {
    const scores = Object.values(categoryScores);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const overallScore = calculateOverallScore();
  
  // Determine maturity level based on score
  const getMaturityLevel = (score: number): string => {
    if (score >= 3.5) return 'Advanced';
    if (score >= 2.5) return 'Established';
    if (score >= 1.5) return 'Emerging';
    return 'Beginning';
  };
  
  const maturityLevel = getMaturityLevel(overallScore);
  
  // Define colors for maturity levels
  const getMaturityColor = (level: string): string => {
    switch (level) {
      case 'Advanced': return '#4CAF50'; // Green
      case 'Established': return '#2196F3'; // Blue
      case 'Emerging': return '#FF9800'; // Orange
      case 'Beginning': return '#F44336'; // Red
      default: return '#9E9E9E'; // Grey
    }
  };
  
  const maturityColor = getMaturityColor(maturityLevel);
  
  // Get maturity description
  const getMaturityDescription = (level: string): string => {
    switch (level) {
      case 'Advanced':
        return 'Your GitHub practices are highly mature. You\'re implementing industry best practices in most areas.';
      case 'Established':
        return 'Your GitHub practices are solid. There are a few areas where you could further enhance your workflows.';
      case 'Emerging':
        return 'You\'re on the right track with GitHub. Focus on the quick wins to improve your development processes.';
      case 'Beginning':
        return 'You\'re just getting started with GitHub best practices. Prioritize the high-impact recommendations.';
      default:
        return '';
    }
  };
  
  const maturityDescription = getMaturityDescription(maturityLevel);
  
  // Calculate percentage for circular progress
  const scorePercentage = (overallScore / 4) * 100;
  const circumference = 2 * Math.PI * 45; // 45 is the radius
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <motion.div 
      className="maturity-score-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>GitHub Maturity Score</h3>
      
      <div className="maturity-content">
        <div className="score-circle-container">
          <svg width="120" height="120" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#e0e0e0" 
              strokeWidth="10" 
            />
            
            {/* Progress circle */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke={maturityColor} 
              strokeWidth="10" 
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Score text */}
            <text 
              x="50" 
              y="45" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="22" 
              fontWeight="bold"
              fill="#333"
            >
              {overallScore.toFixed(1)}
            </text>
            
            {/* "out of 4" text */}
            <text 
              x="50" 
              y="65" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12"
              fill="#666"
            >
              out of 4
            </text>
          </svg>
        </div>
        
        <div className="maturity-info">
          <div className="maturity-level" style={{ color: maturityColor }}>
            {maturityLevel}
          </div>
          <p className="maturity-description">
            {maturityDescription}
          </p>
          
          <div className="industry-benchmark">
            <div className="benchmark-label">Industry Benchmark:</div>
            <div className="benchmark-value">
              Most {maturityLevel === 'Beginning' || maturityLevel === 'Emerging' 
                ? 'Series A' 
                : 'Series B+'} 
              startups score {maturityLevel === 'Advanced' 
                ? '3.2-3.8' 
                : maturityLevel === 'Established' 
                  ? '2.8-3.4' 
                  : maturityLevel === 'Emerging' 
                    ? '2.0-2.8' 
                    : '1.5-2.2'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MaturityScoreCard; 