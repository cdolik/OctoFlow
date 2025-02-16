import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STAGE_CONFIG } from '../data/stages';

const StageSelector = () => {
  const navigate = useNavigate();

  const handleStageSelect = (stageId) => {
    try {
      // Save stage to session storage
      sessionStorage.setItem('selectedStage', stageId);
      // Clear any previous assessment data
      sessionStorage.removeItem('assessmentAnswers');
      sessionStorage.removeItem('currentCategory');
      
      // Track stage selection
      console.log('Stage selected:', stageId);
      
      // Navigate to assessment
      navigate('/assessment', { 
        state: { stage: stageId }
      });
    } catch (error) {
      console.error('Error selecting stage:', error);
      alert('There was an error selecting the stage. Please try again.');
    }
  };

  return (
    <div className="stage-selector">
      <h2>Select Your Company Stage</h2>
      <div className="stage-grid">
        {Object.entries(STAGE_CONFIG).map(([id, config]) => (
          <div 
            key={id}
            className="stage-card"
            onClick={() => handleStageSelect(id)}
          >
            <h3>{config.label}</h3>
            <p>{config.description}</p>
            {config.focus && (
              <div className="focus-areas">
                <h4>Focus Areas:</h4>
                <ul>
                  {config.focus.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageSelector;