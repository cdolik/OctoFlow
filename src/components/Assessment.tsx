import React, { useState, useEffect } from 'react';
import { getStageQuestions } from '../data/questions';
import { updateAssessmentResponse, getAssessmentResponses, saveAssessmentResponses } from '../utils/storage';
import { trackQuestionAnswer, trackAssessmentComplete } from '../utils/analytics';
import GitHubTooltip from './GitHubTooltip';
import ProgressTracker from './ProgressTracker';
import AutoSave from './AutoSave';
import withFlowValidation, { Stage, Responses } from './withFlowValidation';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';
import './styles.css';

interface Question {
  id: string;
  text: string;
  tooltipTerm?: string;
  options: Array<{
    value: string;
    text: string;
  }>;
}

interface AssessmentProps {
  stage: Stage;
  onComplete: (responses: Responses) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ stage, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const questions = getStageQuestions(stage) as Question[];

  // Load saved responses on mount
  useEffect(() => {
    const savedResponses = getAssessmentResponses();
    if (Object.keys(savedResponses).length > 0) {
      setResponses(savedResponses);
    }
  }, []);

  const handleSave = (data: Record<string, string>): void => {
    saveAssessmentResponses(data);
  };

  const handleAnswer = (questionId: string, value: string): void => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };
    setResponses(newResponses);
    updateAssessmentResponse(questionId, value);
    trackQuestionAnswer(questionId, value);
  };

  const handleNext = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      trackAssessmentComplete(responses);
      onComplete(responses as unknown as Responses);
    }
  };

  const handleBack = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length;
  const canProceed = responses[currentQuestion?.id] !== undefined;

  return (
    <AssessmentErrorBoundary>
      <AutoSave data={responses} onSave={handleSave} interval={30000} />
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
                type="button"
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
              type="button"
            >
              Back
            </button>
            <button 
              className="next-button"
              onClick={handleNext}
              disabled={!canProceed}
              type="button"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </AssessmentErrorBoundary>
  );
};

export default withFlowValidation(Assessment);