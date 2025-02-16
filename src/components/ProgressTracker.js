import React from 'react';
import './styles.css';

const TOTAL_QUESTIONS = 10;
const AVG_TIME_PER_QUESTION = 30; // seconds

const ProgressTracker = ({ currentQuestion }) => {
  const progress = (currentQuestion / TOTAL_QUESTIONS) * 100;
  const remainingQuestions = TOTAL_QUESTIONS - currentQuestion;
  const remainingTime = Math.ceil((remainingQuestions * AVG_TIME_PER_QUESTION) / 60);

  return (
    <div className="progress-tracker">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-stats">
        <span>⏱️ ~{remainingTime} min remaining</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
};

export default ProgressTracker;