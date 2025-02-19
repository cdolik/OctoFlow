import React, { useState, useEffect } from 'react';
import { getStageQuestions } from '../data/questions';
import { updateAssessmentResponse, getAssessmentResponses, saveAssessmentResponses } from '../utils/storage';
import { trackQuestionAnswer, trackAssessmentComplete } from '../utils/analytics';
import GitHubTooltip from './GitHubTooltip';
import ProgressTracker from './ProgressTracker';
import AutoSave from './AutoSave';
import { withFlowValidation, Stage } from './withFlowValidation';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';
import './styles.css';

interface Option {
  value: number;
  text: string;
}

interface Question {
  id: string;
  text: string;
  tooltipTerm?: string;
  options: Option[];
}

interface AssessmentProps {
  stage: {
    id: Stage;
    name: string;
  };
  onComplete: (responses: Record<string, number>) => void;
}

type Responses = Record<string, number>;

const Assessment: React.FC<AssessmentProps> = ({ stage, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const questions = getStageQuestions(stage.id);

  useEffect(() => {
    const savedResponses = getAssessmentResponses();
    if (Object.keys(savedResponses).length > 0) {
      setResponses(savedResponses);
    }
  }, []);

  const handleSave = (data: Responses) => {
    saveAssessmentResponses(data);
  };

  const handleAnswer = (questionId: string, value: number) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };
    setResponses(newResponses);
    updateAssessmentResponse(questionId, value);
    trackQuestionAnswer(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      trackAssessmentComplete(responses);
      onComplete(responses);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex] as Question;
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