import React from 'react';
import GitHubTooltip from './GitHubTooltip';
import { stages } from '../data/stages';
import { trackStageSelect } from '../utils/analytics';
import './styles.css';

interface Stage {
  id: 'pre-seed' | 'seed' | 'series-a';
  label: string;
  description: string;
  benchmarks: {
    deploymentFreq: string;
    securityLevel: number;
    costEfficiency: number;
    expectedScores: {
      'github-ecosystem': number;
      'security': number;
      'automation': number;
    };
  };
}

interface StageSelectorProps {
  onSelect: (stageId: Stage['id']) => void;
}

export const StageSelector: React.FC<StageSelectorProps> = ({ onSelect }) => {
  const handleStageSelect = (stageId: Stage['id']) => {
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
            onClick={() => handleStageSelect(stage.id as Stage['id'])}
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
};

export default StageSelector;