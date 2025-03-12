import React from 'react';

interface ActionButtonsProps {
  onReset: () => void;
  onViewHistory: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onViewHistory, onReset }) => {
  return (
    <div className="action-buttons">
      <button 
        className="action-button history-button"
        onClick={onViewHistory}
      >
        View Assessment History
      </button>
      
      <button 
        className="action-button reset-button"
        onClick={onReset}
      >
        Start New Assessment
      </button>
      
      <a 
        href="https://github.com/cdolik/OctoFlow"
        target="_blank"
        rel="noopener noreferrer"
        className="action-button github-button"
      >
        View on GitHub
      </a>
    </div>
  );
};

export default ActionButtons; 