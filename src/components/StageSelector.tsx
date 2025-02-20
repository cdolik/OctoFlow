import React from 'react';
import { stages } from '../data/categories';
import TimeEstimator from './TimeEstimator';
import './styles.css';

interface StageSelectorProps {
  onStageSelect: (stage: string) => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({ onStageSelect }) => {
  return (
    <div className="stage-selector">
      <h1>Welcome to OctoFlow</h1>
      <p className="subtitle">
        Select your startup stage to get personalized GitHub workflow recommendations
      </p>
      
      <div className="stages-grid">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="stage-card"
            onClick={() => onStageSelect(stage.id)}
            role="button"
            tabIndex={0}
          >
            <h3>{stage.label}</h3>
            <p>{stage.description}</p>
            
            <div className="stage-benchmarks">
              <div className="benchmark-item">
                <span>Typical Team Size:</span>
                {stage.id === 'pre-seed' && ' 1-5 developers'}
                {stage.id === 'seed' && ' 5-15 developers'}
                {stage.id === 'series-a' && ' 15+ developers'}
              </div>
              <div className="benchmark-item">
                <span>Deployment Frequency: </span>
                {stage.benchmarks.deploymentFreq}
              </div>
            </div>

            <div className="stage-assessment-info">
              <TimeEstimator 
                questionCount={Object.values(stage.benchmarks.expectedScores).length}
                showDetails={true}
              />
            </div>

            <div className="focus-areas">
              {stage.id === 'pre-seed' && (
                <>
                  <span className="focus-tag">Basic Automation</span>
                  <span className="focus-tag">Core Security</span>
                </>
              )}
              {stage.id === 'seed' && (
                <>
                  <span className="focus-tag">Team Collaboration</span>
                  <span className="focus-tag">CI/CD</span>
                  <span className="focus-tag">Security</span>
                </>
              )}
              {stage.id === 'series-a' && (
                <>
                  <span className="focus-tag">Advanced Security</span>
                  <span className="focus-tag">Scale & Performance</span>
                  <span className="focus-tag">Team Growth</span>
                </>
              )}
            </div>

            <button className="select-stage-button">
              Start Assessment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageSelector;