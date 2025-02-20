import React from 'react';
import './styles.css';

interface TimeEstimatorProps {
  questionCount: number;
  avgTimePerQuestion?: number; // in minutes
  showDetails?: boolean;
}

const TimeEstimator: React.FC<TimeEstimatorProps> = ({
  questionCount,
  avgTimePerQuestion = 0.5,
  showDetails = false
}) => {
  const totalTime = questionCount * avgTimePerQuestion;
  const estimatedMinutes = Math.ceil(totalTime);

  return (
    <div className="time-estimator">
      <div className="time-estimate">
        <span className="time-value">{estimatedMinutes}</span> min
      </div>
      {showDetails && (
        <div className="estimate-details">
          <span>{questionCount} questions</span>
          <span>~{avgTimePerQuestion} min per question</span>
        </div>
      )}
    </div>
  );
};

export default TimeEstimator;