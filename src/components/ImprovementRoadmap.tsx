import React, { useState } from 'react';
import { Category } from '../data/questions';
import { StartupStage } from '../data/questions';
import { generateImprovementRoadmap } from '../utils/eligibility';

interface ImprovementRoadmapProps {
  categoryScores: Record<Category, number>;
  stage?: StartupStage;
  companyInfo?: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  };
}

const ImprovementRoadmap: React.FC<ImprovementRoadmapProps> = ({ categoryScores, stage, companyInfo }) => {
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);
  
  const roadmap = generateImprovementRoadmap(categoryScores, companyInfo);
  
  // Toggle expanded category
  const toggleCategory = (category: Category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };
  
  // Get color based on score difference
  const getScoreColor = (current: number, target: number) => {
    const diff = target - current;
    if (diff > 1.5) return 'var(--color-danger)';
    if (diff > 0.5) return 'var(--color-warning)';
    return 'var(--color-success)';
  };
  
  if (roadmap.length === 0) {
    return (
      <div className="improvement-roadmap">
        <h3>Improvement Roadmap</h3>
        <div className="no-improvements">
          <p>Great job! Your GitHub practices already meet the requirements for the GitHub for Startups program.</p>
          <p>Continue maintaining these good practices to ensure your eligibility.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="improvement-roadmap">
      <h3>Improvement Roadmap {stage && `for ${stage}`}</h3>
      <p className="roadmap-description">
        Based on your assessment, here are specific improvements that can help you qualify for the GitHub for Startups program.
        Each category includes actionable steps and resources to help you implement these improvements.
      </p>
      
      <div className="roadmap-items">
        {roadmap.map((item) => (
          <div key={item.category} className="roadmap-item">
            <div 
              className="roadmap-header" 
              onClick={() => toggleCategory(item.category)}
            >
              <div className="roadmap-category">
                <h4>{item.category}</h4>
              </div>
              <div 
                className="roadmap-score" 
                style={{ color: getScoreColor(item.currentScore, item.targetScore) }}
              >
                <span className="current-score">{item.currentScore.toFixed(1)}</span>
                <span className="score-separator">/</span>
                <span className="target-score">{item.targetScore.toFixed(1)}</span>
              </div>
              <div className="roadmap-toggle">
                <i className={`fas fa-chevron-${expandedCategory === item.category ? 'up' : 'down'}`}></i>
              </div>
            </div>
            
            {expandedCategory === item.category && (
              <div className="roadmap-details">
                <div className="roadmap-actions">
                  <h5>Recommended Actions:</h5>
                  <ul className="action-list">
                    {item.actionItems.map((action, index) => (
                      <li key={index} className="action-item">
                        <i className="fas fa-check-circle"></i>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="roadmap-resources">
                  <h5>Helpful Resources:</h5>
                  <ul className="resource-list">
                    {item.resources.map((resource, index) => (
                      <li key={index} className="resource-item">
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          <i className="fas fa-book"></i>
                          <span>{resource.title}</span>
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="roadmap-footer">
        <p>
          Implementing these improvements will help you qualify for the GitHub for Startups program
          and enhance your overall GitHub workflow.
        </p>
      </div>
    </div>
  );
};

export default ImprovementRoadmap; 