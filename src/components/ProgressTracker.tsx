import React from 'react';
import './styles.css';

interface ProgressTrackerProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  progress, 
  currentQuestion, 
  totalQuestions 
}) => {
  return (
    <div className="progress-tracker" role="progressbar" aria-valuenow={progress}>
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-info">
        <span>Question {currentQuestion} of {totalQuestions}</span>
        <span>{progress.toFixed(0)}% Complete</span>
      </div>
    </div>
  );
};

export default ProgressTracker;