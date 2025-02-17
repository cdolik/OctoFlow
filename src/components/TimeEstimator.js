import React, { useState, useEffect } from 'react';

export default function TimeEstimator({ totalQuestions, questionsAnswered, avgTimePerQuestion = 1.2 }) {
  const [secondsRemaining, setSeconds] = useState(
    (totalQuestions - questionsAnswered) * avgTimePerQuestion * 60
  );
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="time-estimate">
      ⏱️ {Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s remaining
      <small>(Octoverse 2024 average)</small>
    </div>
  );
}