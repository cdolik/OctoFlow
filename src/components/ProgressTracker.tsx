import React from 'react';
import './styles.css';

interface ProgressTrackerProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  currentQuestion,
  totalQuestions
}) => {
  return (
    <div className="progress-tracker">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="progress-info">
        <div className="progress-stats">
          <span>Question {currentQuestion} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="estimated-time">
          Est. {Math.ceil((totalQuestions - currentQuestion + 1) * 0.5)} min remaining
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;