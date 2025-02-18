import React, { useState } from 'react';
import { getStageQuestions } from '../data/questions';
import GitHubTooltip from './GitHubTooltip';
import ProgressTracker from './ProgressTracker';
import './styles.css';

export default function Assessment({ stage, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const questions = getStageQuestions(stage);

  const handleAnswer = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(responses);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length;
  const canProceed = responses[currentQuestion?.id] !== undefined;

  return (
    <div className="assessment-container">
      <ProgressTracker 
        progress={progress}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="question-card">
        <div className="question-header">
          {currentQuestion?.tooltipTerm && (
            <GitHubTooltip term={currentQuestion.tooltipTerm}>
              <h3 className="question-text">{currentQuestion?.text}</h3>
            </GitHubTooltip>
          )}
          {!currentQuestion?.tooltipTerm && (
            <h3 className="question-text">{currentQuestion?.text}</h3>
          )}
        </div>

        <div className="options-grid">
          {currentQuestion?.options.map((option) => (
            <button
              key={option.value}
              className={`option-button ${responses[currentQuestion.id] === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
            >
              <div className="option-content">
                <span className="option-label">{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="navigation-buttons">
          <button 
            className="back-button"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
          >
            Back
          </button>
          <button 
            className="next-button"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}