import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STAGE_CONFIG } from '../data/stages';

const StageSelector = () => {
  const navigate = useNavigate();

  const handleStageSelect = (stage) => {
    sessionStorage.setItem('selectedStage', stage);
    sessionStorage.setItem('assessmentAnswers', '{}');
    sessionStorage.setItem('currentCategory', '0');
    navigate('/assessment');
  };

  const stages = Object.entries(STAGE_CONFIG);

  return (
    <div className="stage-selector">
      <h2>Welcome to OctoFlow</h2>
      <p className="subtitle">Select your company stage to begin the assessment</p>
      
      <div className="stages-grid">
        {stages.map(([key, stage]) => (
          <button
            key={key}
            className="stage-card"
            onClick={() => handleStageSelect(key)}
          >
            <h3>{stage.label}</h3>
            <p>{stage.description}</p>
            <div className="focus-areas">
              {stage.focus.map(area => (
                <span key={area} className="focus-tag">{area}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StageSelector;