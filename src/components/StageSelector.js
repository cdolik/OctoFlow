import React from 'react';
import GitHubTooltip from './GitHubTooltip';
import { trackStageSelect } from '../utils/analytics';
import './styles.css';

export default function StageSelector({ onSelect }) {
  const stages = [
    {
      id: 'pre-seed',
      title: 'Pre-Seed',
      description: 'Building MVP • 1-10 developers',
      benefit: 'Eligible for 20 free GitHub Enterprise seats',
      benchmark: '2 deployments/week (Octoverse 2024)',
      focusAreas: ['CI Setup', 'Branch Protection', 'Basic Security']
    },
    {
      id: 'series-a',
      title: 'Series A',
      description: 'Growing teams • 10-50 developers',
      benefit: 'Advanced security features included',
      benchmark: '12 deployments/week (Octoverse 2024)',
      focusAreas: ['Advanced Security', 'Workflow Automation', 'Team Scaling']
    },
    {
      id: 'series-b',
      title: 'Series B+',
      description: 'Scaling teams • 50+ developers',
      benefit: 'Enterprise-grade security and compliance',
      benchmark: '25+ deployments/week (Octoverse 2024)',
      focusAreas: ['Enterprise Security', 'Custom Workflows', 'Compliance']
    }
  ];

  const handleStageSelect = (stageId) => {
    trackStageSelect(stageId);
    onSelect(stageId);
  };

  return (
    <div className="stage-selector">
      <h2>Select Your Startup Stage</h2>
      <p className="subtitle">We'll tailor recommendations based on your phase</p>
      
      <div className="stages-grid">
        {stages.map(stage => (
          <div 
            key={stage.id} 
            className="stage-card"
            onClick={() => handleStageSelect(stage.id)}
          >
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
            
            <div className="benchmark">
              <GitHubTooltip term="Octoverse">
                <span>📈 {stage.benchmark}</span>
              </GitHubTooltip>
            </div>
            
            <div className="focus-areas">
              {stage.focusAreas.map(area => (
                <span key={area} className="focus-tag">{area}</span>
              ))}
            </div>
            
            <div className="benefit">
              <GitHubTooltip term="GitHub for Startups">
                <span className="benefit-text">✨ {stage.benefit}</span>
              </GitHubTooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}