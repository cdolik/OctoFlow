import React from 'react';
import './styles.css';

interface ProgressTrackerProps {
  progress: number;
  timeRemaining: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="progress-tracker">
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="time-remaining">
        ⏱️ {minutes}:{seconds.toString().padStart(2, '0')} remaining
        <small>Based on Octoverse 2024 average completion time</small>
      </div>
    </div>
  );
};

export default ProgressTracker;