import React, { useState } from 'react';
import GitHubTooltip from './GitHubTooltip';
import ProgressTracker from './ProgressTracker';
import TimeEstimator from './TimeEstimator';
import { getStageQuestions } from '../data/categories';
import { saveAssessmentResponse, getAssessmentResponses } from '../utils/storage';
import { trackQuestionAnswer } from '../utils/analytics';
import './styles.css';

export default function Assessment({ stage, onStepChange }) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(getAssessmentResponses());

  // Get stage-specific questions
  const categories = getStageQuestions(stage);
  const currentCategory = categories[categoryIndex];
  const currentQuestion = currentCategory?.questions[questionIndex];
  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const questionsAnswered = Object.keys(responses).length;
  const progress = (questionsAnswered / totalQuestions) * 100;

  const handleAnswer = (value) => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    setResponses(prev => ({ ...prev, [questionId]: value }));
    saveAssessmentResponse(questionId, value);
    trackQuestionAnswer(questionId, value);

    // Navigation logic
    if (questionIndex < currentCategory.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
      setQuestionIndex(0);
    } else {
      onStepChange(3); // Move to Summary
    }
  };

  if (!currentCategory || !currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="assessment">
      <div className="stage-indicator">
        <span className="stage-label">{stage} Stage Assessment</span>
        <span className="stage-focus">Focus: {currentCategory.title}</span>
      </div>

      <ProgressTracker progress={progress} />
      <TimeEstimator 
        totalQuestions={totalQuestions} 
        questionsAnswered={questionsAnswered} 
      />

      <div className="question-container">
        <h3>
          {currentQuestion.text}{' '}
          {currentQuestion.tooltipTerm && (
            <GitHubTooltip term={currentQuestion.tooltipTerm}>
              <span className="tooltip-trigger">{currentQuestion.tooltipTerm}</span>
            </GitHubTooltip>
          )}
          {currentQuestion.textAfter}
        </h3>

        <div className="options-grid">
          {currentQuestion.options.map(option => (
            <button
              key={option.value}
              className={`option-button ${responses[currentQuestion.id] === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {currentQuestion.recommendation && (
          <div className="question-hint">
            <small>
              <a 
                href={currentQuestion.recommendation.link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Learn more about this practice →
              </a>
            </small>
          </div>
        )}
      </div>
    </div>
  );
}