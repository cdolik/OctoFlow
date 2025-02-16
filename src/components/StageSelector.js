import React from 'react';
import { useNavigate } from 'react-router-dom';
import { trackAssessmentStart } from '../utils/analytics';
import { stages } from '../data/categories';
import './styles.css';

const StageSelector = () => {
  const navigate = useNavigate();

  const handleStageSelect = (stageId) => {
    sessionStorage.setItem('octoflow_stage', stageId);
    trackAssessmentStart(stageId);
    navigate('/assessment');
  };

  return (
    <div className="stage-selector">
      <h2>Select Your Startup Stage</h2>
      <div className="stages-grid">
        {stages.map(stage => (
          <div 
            key={stage.id}
            className="stage-card"
            onClick={() => handleStageSelect(stage.id)}
          >
            <h3>{stage.label}</h3>
            <p>{stage.description}</p>
            <div className="stage-benchmarks">
              <div className="benchmark-item">
                <span>🚀 Deployment: {stage.benchmarks.deploymentFreq}</span>
              </div>
              <div className="benchmark-item">
                <span>🔒 Security Level: {stage.benchmarks.securityLevel}</span>
              </div>
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