import React from 'react';
import GitHubTooltip from './GitHubTooltip';
import { stages } from '../data/questions';
import { trackStageSelect } from '../utils/analytics';
import './styles.css';

export default function StageSelector({ onSelect }) {
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
            <h3>{stage.label}</h3>
            <p>{stage.description}</p>
            
            <div className="benchmark">
              <GitHubTooltip term="deployment-frequency">
                <span>📈 {stage.benchmarks.deploymentFreq} deployments</span>
              </GitHubTooltip>
            </div>
            
            <div className="focus-areas">
              <GitHubTooltip term="github-ecosystem">
                <span className="focus-tag">GitHub Score: {stage.benchmarks.expectedScores['github-ecosystem']}</span>
              </GitHubTooltip>
              <GitHubTooltip term="security">
                <span className="focus-tag">Security Score: {stage.benchmarks.expectedScores['security']}</span>
              </GitHubTooltip>
              <GitHubTooltip term="automation">
                <span className="focus-tag">Automation Score: {stage.benchmarks.expectedScores['automation']}</span>
              </GitHubTooltip>
            </div>
            
            <div className="benefit">
              <GitHubTooltip term="cost-efficiency">
                <span className="benefit-text">✨ Cost Efficiency: {(stage.benchmarks.costEfficiency * 100).toFixed(0)}%</span>
              </GitHubTooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}