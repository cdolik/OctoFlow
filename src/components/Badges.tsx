import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../data/questions';

interface BadgesProps {
  categoryScores: Record<Category, number>;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category?: Category;
  threshold: number;
  earned: boolean;
}

const Badges: React.FC<BadgesProps> = ({ categoryScores }) => {
  // Define badges based on category scores
  const badges: Badge[] = [
    {
      id: 'security-master',
      title: 'Security Master',
      description: 'Achieved excellence in GitHub security practices',
      icon: '🔒',
      category: Category.Security,
      threshold: 3.5,
      earned: (categoryScores[Category.Security] || 0) >= 3.5
    },
    {
      id: 'collaboration-pro',
      title: 'Collaboration Pro',
      description: 'Mastered GitHub collaboration workflows',
      icon: '👥',
      category: Category.Collaboration,
      threshold: 3.5,
      earned: (categoryScores[Category.Collaboration] || 0) >= 3.5
    },
    {
      id: 'automation-wizard',
      title: 'Automation Wizard',
      description: 'Excelled at GitHub automation practices',
      icon: '⚙️',
      category: Category.Automation,
      threshold: 3.5,
      earned: (categoryScores[Category.Automation] || 0) >= 3.5
    },
    {
      id: 'compliance-expert',
      title: 'Compliance Expert',
      description: 'Demonstrated expertise in compliance practices',
      icon: '📋',
      category: Category.Compliance,
      threshold: 3.5,
      earned: (categoryScores[Category.Compliance] || 0) >= 3.5
    },
    {
      id: 'testing-guru',
      title: 'Testing Guru',
      description: 'Achieved excellence in testing practices',
      icon: '🧪',
      category: Category.Testing,
      threshold: 3.5,
      earned: (categoryScores[Category.Testing] || 0) >= 3.5
    },
    {
      id: 'documentation-star',
      title: 'Documentation Star',
      description: 'Excelled at documentation practices',
      icon: '📚',
      category: Category.Documentation,
      threshold: 3.5,
      earned: (categoryScores[Category.Documentation] || 0) >= 3.5
    },
    {
      id: 'github-champion',
      title: 'GitHub Champion',
      description: 'Achieved excellence across all GitHub practice categories',
      icon: '🏆',
      threshold: 3.0,
      earned: Object.values(categoryScores).every(score => score >= 3.0)
    }
  ];

  // Count earned badges
  const earnedBadges = badges.filter(badge => badge.earned);
  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;
  
  // Animation variants for badges
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const badgeVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <div className="badges-container">
      <h3>Achievements</h3>
      
      <div className="badges-progress">
        <div className="badges-count">
          <span className="earned">{earnedCount}</span>
          <span className="separator">/</span>
          <span className="total">{totalCount}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <motion.div 
        className="badges-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {badges.map(badge => (
          <motion.div 
            key={badge.id}
            className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
            variants={badgeVariants}
          >
            <div className="badge-icon">{badge.icon}</div>
            <div className="badge-info">
              <h4>{badge.title}</h4>
              <p>{badge.description}</p>
              {badge.category && (
                <span className="badge-category">{badge.category}</span>
              )}
              {!badge.earned && (
                <div className="badge-requirement">
                  Score {badge.threshold}+ {badge.category ? `in ${badge.category}` : 'across all categories'}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Badges; 