import React from 'react';
import { StartupStage } from '../data/questions';

interface StageSelectorProps {
  onSelectStage: (stage: StartupStage) => void;
}

const StageSelector: React.FC<StageSelectorProps> = ({ onSelectStage }) => {
  return (
    <div className="stage-selector">
      <h1>Welcome to OctoFlow</h1>
      <p className="description">
        Select your startup stage to begin the GitHub practices assessment:
      </p>
      
      <div className="stage-options">
        <div className="stage-card" onClick={() => onSelectStage(StartupStage.Seed)}>
          <h2>Seed / Earlier</h2>
          <p>Focus on foundational GitHub workflows, basic version control, and team collaboration.</p>
        </div>
        
        <div className="stage-card" onClick={() => onSelectStage(StartupStage.SeriesA)}>
          <h2>Series A</h2>
          <p>Emphasis on scaling practices, code quality, security, and enhanced collaboration techniques.</p>
        </div>
        
        <div className="stage-card" onClick={() => onSelectStage(StartupStage.SeriesB)}>
          <h2>Series B+</h2>
          <p>Advanced security, compliance, and scalability for growing engineering organizations.</p>
        </div>
      </div>
    </div>
  );
};

export default StageSelector; 