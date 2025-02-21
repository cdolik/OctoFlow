import React, { useState, useEffect, useCallback } from 'react';
import { trackQuestionAnswer } from '../utils/analytics';

interface TimeEstimatorProps {
  questionsRemaining: number;
  questionId: string;
}

const calculateEstimatedTime = (questionsRemaining: number, averages: number[]): number => {
  if (averages.length === 0) return questionsRemaining * 30; // Default 30s per question
  const recentAverage = averages.reduce((a, b) => a + b, 0) / averages.length;
  return Math.ceil(questionsRemaining * recentAverage);
};

export const TimeEstimator: React.FC<TimeEstimatorProps> = ({ questionsRemaining, questionId }) => {
  const [secondsRemaining, setSeconds] = useState<number>(questionsRemaining * 30);
  const [questionStart, setQuestionStart] = useState<number>(Date.now());
  const [timeAverages, setTimeAverages] = useState<number[]>([]);

  const updateTimeAverage = useCallback((questionTime: number) => {
    setTimeAverages(prev => {
      const newAverages = [...prev, questionTime];
      // Keep only last 5 question times for average
      return newAverages.slice(-5);
    });
  }, []);

  // Reset timer when question changes
  useEffect(() => {
    const prevQuestionTime = (Date.now() - questionStart) / 1000;
    if (prevQuestionTime > 5) { // Only count if spent more than 5s on question
      updateTimeAverage(prevQuestionTime);
      trackQuestionAnswer(questionId, null, prevQuestionTime);
    }
    setQuestionStart(Date.now());
    setSeconds(calculateEstimatedTime(questionsRemaining, timeAverages));
  }, [questionId, questionsRemaining, questionStart, timeAverages, updateTimeAverage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        const newTime = Math.max(0, prev - 1);
        // Update estimate if actual time exceeds estimate significantly
        if (newTime === 0 && questionsRemaining > 0) {
          return calculateEstimatedTime(questionsRemaining, timeAverages);
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questionsRemaining, timeAverages]);

  if (questionsRemaining === 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  
  return (
    <div 
      className="time-estimate" 
      role="timer" 
      aria-label="Estimated time remaining"
    >
      <span className="time-icon">⏱️</span>
      <span className="time-text">
        {minutes > 0 ? `${minutes}m ` : ''}{seconds}s remaining
      </span>
      <span className="time-source">
        {timeAverages.length > 0 ? 'Based on your pace' : 'Based on average completion time'}
      </span>
    </div>
  );
};

export default TimeEstimator;