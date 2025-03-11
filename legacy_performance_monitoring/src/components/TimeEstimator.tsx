import React, { useState, useEffect } from 'react';

interface TimeEstimation {
  shortEstimate: number;
  longEstimate: number;
  averageTime: number;
}

interface TimeEstimatorProps {
  questionCount: number;
  averageTimePerQuestion?: number;
  variancePercent?: number;
  onEstimationComplete?: (estimation: TimeEstimation) => void;
}

export const TimeEstimator: React.FC<TimeEstimatorProps> = ({
  questionCount,
  averageTimePerQuestion = 120, // 2 minutes default
  variancePercent = 20,
  onEstimationComplete
}) => {
  const [estimation, setEstimation] = useState<TimeEstimation>({
    shortEstimate: 0,
    longEstimate: 0,
    averageTime: 0
  });

  useEffect(() => {
    const variance = (averageTimePerQuestion * variancePercent) / 100;
    const totalAverageTime = questionCount * averageTimePerQuestion;
    
    const newEstimation = {
      shortEstimate: Math.max(0, totalAverageTime - (questionCount * variance)),
      longEstimate: totalAverageTime + (questionCount * variance),
      averageTime: totalAverageTime
    };

    setEstimation(newEstimation);
    onEstimationComplete?.(newEstimation);
  }, [questionCount, averageTimePerQuestion, variancePercent]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="time-estimator">
      <p>Estimated time to complete:</p>
      <p className="estimate-range">
        {formatTime(estimation.shortEstimate)} - {formatTime(estimation.longEstimate)}
      </p>
      <p className="average-time">
        Average completion time: {formatTime(estimation.averageTime)}
      </p>
    </div>
  );
};

export default TimeEstimator;