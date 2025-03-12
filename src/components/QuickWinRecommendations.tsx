import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Category } from '../data/questions';
import { trackRecommendationClick } from '../utils/analyticsUtils';

interface QuickWinRecommendationsProps {
  recommendations: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Interface for categorized recommendations
interface EffortCategorizedRecs {
  easy: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  medium: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  hard: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const QuickWinRecommendations: React.FC<QuickWinRecommendationsProps> = ({ recommendations }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedRecs, setExpandedRecs] = useState<number[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<{id: number, message: string} | null>(null);

  // Filter recommendations by category and search term
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = filter === 'all' || rec.category === filter;
    const matchesSearch = rec.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by priority (high first)
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const toggleExpand = (index: number) => {
    if (expandedRecs.includes(index)) {
      setExpandedRecs(expandedRecs.filter(i => i !== index));
    } else {
      setExpandedRecs([...expandedRecs, index]);
    }
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(recommendations.map(rec => rec.category)));

  // Estimated implementation time based on priority
  const getEffortEstimate = (priority: string) => {
    switch (priority) {
      case 'high': return '< 1 day';
      case 'medium': return '1-3 days';
      case 'low': return '3-7 days';
      default: return 'Unknown';
    }
  };

  // Get estimated impact level based on priority
  const getImpactLevel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High impact';
      case 'medium': return 'Medium impact';
      case 'low': return 'Incremental improvement';
      default: return 'Unknown impact';
    }
  };

  // Method to categorize recommendations by implementation effort
  const categorizeByEffort = (recs: QuickWinRecommendationsProps['recommendations']): EffortCategorizedRecs => {
    return recs.reduce((acc: EffortCategorizedRecs, rec) => {
      if (rec.priority === 'high') {
        acc.easy.push(rec);
      } else if (rec.priority === 'medium') {
        acc.medium.push(rec);
      } else {
        acc.hard.push(rec);
      }
      return acc;
    }, { easy: [], medium: [], hard: [] });
  };
  
  const categorizedRecs = categorizeByEffort(recommendations);
  
  // Get top quick wins (prioritizing high priority + easy implementation)
  const getQuickWins = () => {
    const quickWins = [];
    
    // First add high priority easy implementations
    const highPriorityEasy = categorizedRecs.easy.filter(rec => rec.priority === 'high');
    quickWins.push(...highPriorityEasy);
    
    // Then add medium priority easy implementations if needed
    if (quickWins.length < 3) {
      const mediumPriorityEasy = categorizedRecs.easy.filter(rec => rec.priority === 'medium');
      quickWins.push(...mediumPriorityEasy.slice(0, 3 - quickWins.length));
    }
    
    // If still need more, add high priority medium implementations
    if (quickWins.length < 3) {
      const highPriorityMedium = categorizedRecs.medium.filter(rec => rec.priority === 'high');
      quickWins.push(...highPriorityMedium.slice(0, 3 - quickWins.length));
    }
    
    // Return top 3 quick wins (or less if not enough recommendations)
    return quickWins.slice(0, 3);
  };
  
  const quickWins = getQuickWins();

  // No quick wins to show if all practices are well-implemented
  if (quickWins.length === 0) {
    return null;
  }
  
  // Better error handling for copy operation
  const handleCopyRecommendation = (e: React.MouseEvent, recommendation: any, index: number) => {
    e.stopPropagation();
    
    try {
      navigator.clipboard.writeText(
        `GitHub Recommendation: ${recommendation.text}\nCategory: ${recommendation.category}\nPriority: ${recommendation.priority}\nDocumentation: ${recommendation.docsUrl}`
      ).then(() => {
        // Success feedback
        setCopyFeedback({ id: index, message: 'Copied!' });
        
        // Clear after 2 seconds
        setTimeout(() => {
          setCopyFeedback(null);
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
        setCopyFeedback({ id: index, message: 'Copy failed' });
        
        setTimeout(() => {
          setCopyFeedback(null);
        }, 2000);
      });
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.error('Copy operation not supported:', err);
      setCopyFeedback({ id: index, message: 'Copy not supported in this browser' });
      
      setTimeout(() => {
        setCopyFeedback(null);
      }, 2000);
    }
  };

  // Better error handling for links
  const handleDocsLinkClick = (e: React.MouseEvent, recommendation: any) => {
    // Track the click with analytics
    trackRecommendationClick(
      recommendation.category,
      recommendation.text,
      recommendation.priority
    );
    
    // If the link fails to open, provide fallback
    try {
      // If it's an external link that might be blocked, handle this gracefully
      if (!recommendation.docsUrl.startsWith('https://docs.github.com')) {
        console.warn('Non-GitHub documentation link detected:', recommendation.docsUrl);
      }
    } catch (err) {
      console.error('Error tracking recommendation click:', err);
      // Don't prevent default navigation
    }
  };

  return (
    <motion.div 
      className="quick-win-recommendations"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="recommendations-header">
        <h2>Quick-Win Recommendations</h2>
        <p className="subheading">Implement these improvements for maximum impact with minimal effort</p>
      </div>

      <div className="recommendations-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <span className="filter-label">Filter by:</span>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-button ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {sortedRecommendations.length === 0 ? (
        <div className="no-recommendations">
          <p>No recommendations match your filters.</p>
          {searchTerm && <p>Try adjusting your search terms or filters.</p>}
          {!searchTerm && recommendations.length === 0 && (
            <p>Great job! Your GitHub practices are already excellent.</p>
          )}
        </div>
      ) : (
        <ul className="recommendations-list">
          {sortedRecommendations.map((recommendation, index) => (
            <li 
              key={index} 
              className={`recommendation-item priority-${recommendation.priority} ${expandedRecs.includes(index) ? 'expanded' : ''}`}
            >
              <div 
                className="recommendation-header" 
                onClick={() => toggleExpand(index)}
                role="button"
                aria-expanded={expandedRecs.includes(index) ? 'true' : 'false'}
                aria-controls={`recommendation-details-${index}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(index);
                  }
                }}
              >
                <span className={`category-tag ${recommendation.category.toLowerCase()}`}>
                  {recommendation.category}
                </span>
                <h3 className="recommendation-title">{recommendation.text}</h3>
                <div className="recommendation-meta">
                  <span className={`priority-indicator ${recommendation.priority}`}>
                    {recommendation.priority.toUpperCase()}
                  </span>
                  <span className="expand-indicator" aria-hidden="true">{expandedRecs.includes(index) ? '−' : '+'}</span>
                </div>
              </div>
              
              {expandedRecs.includes(index) && (
                <div className="recommendation-details" id={`recommendation-details-${index}`}>
                  <div className="effort-estimate">
                    <strong>Estimated effort:</strong> {getEffortEstimate(recommendation.priority)}
                  </div>
                  <div className="impact-estimate">
                    <strong>Impact:</strong> {getImpactLevel(recommendation.priority)}
                  </div>
                  <div className="implementation-steps">
                    <h4>How to implement:</h4>
                    <p>Follow the GitHub documentation below to learn how to implement this recommendation:</p>
                    <a 
                      href={recommendation.docsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="github-docs-link"
                      onClick={(e) => handleDocsLinkClick(e, recommendation)}
                    >
                      <span className="github-icon">📄</span>
                      View GitHub Documentation
                      <span className="external-link-icon">↗</span>
                    </a>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="mark-complete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // In a full implementation, this would mark as completed in state/storage
                        alert('In a full implementation, this would mark the recommendation as completed.');
                      }}
                    >
                      Mark as Complete
                    </button>
                    <button
                      className="copy-button"
                      onClick={(e) => handleCopyRecommendation(e, recommendation, index)}
                      disabled={copyFeedback?.id === index}
                    >
                      {copyFeedback?.id === index ? copyFeedback.message : 'Copy to Clipboard'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default QuickWinRecommendations; 