import React, { useState } from 'react';
import { Stage } from '../types';
import { stages } from '../data/stages';
import './styles.css';

interface StageSelectorProps {
  onSelect: (stageId: Stage) => void;
  initialStage?: Stage;
}

const StageSelector: React.FC<StageSelectorProps> = ({ onSelect, initialStage }) => {
  const [filter, setFilter] = useState('');

  const filteredStages = stages.filter(stage =>
    stage.label.toLowerCase().includes(filter.toLowerCase()) ||
    stage.description.toLowerCase().includes(filter.toLowerCase()) ||
    stage.focus.some(f => f.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleStageSelect = (stageId: Stage) => {
    // Add logic to handle unsaved changes before navigating
    const hasUnsavedChanges = false; // Replace with actual logic to check for unsaved changes
    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm('You have unsaved changes. Do you want to proceed?');
      if (!confirmNavigation) {
        return;
      }
    }
    onSelect(stageId);
  };

  return (
    <div className="stage-selector">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search stages"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="stages-grid">
        {filteredStages.length === 0 ? (
          <p className="no-results">No stages found</p>
        ) : (
          filteredStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStageSelect(stage.id)}
              className={`stage-card ${initialStage === stage.id ? 'current' : ''}`}
              tabIndex={0}
            >
              <h3>{stage.label}</h3>
              <p>{stage.description}</p>
              
              <div className="stage-metrics">
                <span className="metric">
                  <strong>Deployments:</strong> {stage.benchmarks.deploymentFreq}
                </span>
                <span className="metric">
                  <strong>Questions:</strong> {Object.keys(stage.benchmarks.expectedScores).length}
                </span>
              </div>

              <div className="focus-areas">
                {stage.focus.map(area => (
                  <span key={area} className="focus-tag">
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </span>
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default StageSelector;
