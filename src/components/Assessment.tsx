import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getStageQuestions } from '../data/questions';
import { updateAssessmentResponse, getAssessmentResponses, saveAssessmentResponses } from '../utils/storage';
import { trackQuestionAnswer, trackAssessmentComplete } from '../utils/analytics';
import GitHubTooltip from './GitHubTooltip';
import ProgressTracker from './ProgressTracker';
import AutoSave from './AutoSave';
import { withFlowValidation, Stage } from './withFlowValidation';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import NavigationGuard from './NavigationGuard';
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
  const [, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const questions = useMemo(() => getStageQuestions(stage.id), [stage.id]);
  const currentQuestion = questions[currentQuestionIndex] as Question;
  
  // Add ref for managing focus
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Reset refs array when options change
    optionsRef.current = optionsRef.current.slice(0, currentQuestion?.options.length);
  }, [currentQuestion]);

  // Load saved progress on mount
  useEffect(() => {
    const savedResponses = getAssessmentResponses();
    if (Object.keys(savedResponses).length > 0) {
      const typedResponses = savedResponses as Responses;
      setResponses(typedResponses);
      // Find the last unanswered question
      const lastAnsweredIndex = questions.findIndex(
        q => !typedResponses[q.id]
      );
      if (lastAnsweredIndex !== -1) {
        setCurrentQuestionIndex(Math.max(0, lastAnsweredIndex));
      }
    }
  }, [questions]);

  const handleSave = async (data: Responses) => {
    try {
      setIsSaving(true);
      saveAssessmentResponses(data);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
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

  const handleOptionSelect = (index: number) => {
    if (currentQuestion?.options[index]) {
      handleAnswer(currentQuestion.id, currentQuestion.options[index].value);
      // Focus the selected option
      optionsRef.current[index]?.focus();
    }
  };

  const progress = (Object.keys(responses).length / questions.length) * 100;
  const canProceed = currentQuestion && responses[currentQuestion.id] !== undefined;

  // Initialize keyboard navigation
  useKeyboardNavigation({
    onNext: handleNext,
    onBack: handleBack,
    onSelect: handleOptionSelect,
    canProceed,
    isFirstQuestion: currentQuestionIndex === 0,
    optionsCount: currentQuestion?.options.length || 0
  });

  // Prevent accidental navigation
  const hasUnsavedChanges = Object.keys(responses).length > 0;

  return (
    <AssessmentErrorBoundary>
      <NavigationGuard hasUnsavedChanges={hasUnsavedChanges} />
      <AutoSave 
        data={responses}
        onSave={handleSave}
        interval={5000}
        onError={(error) => console.error('Failed to save progress:', error)}
      />
      <div 
        className="assessment-container"
        role="main"
        aria-label={`Assessment for ${stage.name} stage`}
      >
        <ProgressTracker 
          progress={progress}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
        <div 
          className="question-card"
          role="form"
          aria-labelledby="current-question"
        >
          {lastSaved && (
            <div className="save-status" role="status">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <div 
            className="keyboard-shortcuts-hint" 
            role="note"
            aria-label="Keyboard shortcuts available"
          >
            <p>Keyboard shortcuts:</p>
            <ul>
              <li>→ or Enter: Next question</li>
              <li>←: Previous question</li>
              <li>1-4: Select option</li>
            </ul>
          </div>
          <div className="question-header">
            {currentQuestion?.tooltipTerm ? (
              <GitHubTooltip term={currentQuestion.tooltipTerm}>
                <h3 id="current-question" className="question-text">
                  {currentQuestion?.text}
                </h3>
              </GitHubTooltip>
            ) : (
              <h3 id="current-question" className="question-text">
                {currentQuestion?.text}
              </h3>
            )}
          </div>
          <div 
            className="options-grid"
            role="radiogroup"
            aria-labelledby="current-question"
          >
            {currentQuestion?.options.map((option, index) => (
              <button
                key={option.value}
                ref={el => optionsRef.current[index] = el}
                className={`option-button ${responses[currentQuestion.id] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                type="button"
                role="radio"
                aria-checked={responses[currentQuestion.id] === option.value}
                aria-label={`Option ${index + 1}: ${option.text}`}
                data-shortcut={index + 1}
              >
                <div className="option-content">
                  <span className="option-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="option-label">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
          <div 
            className="navigation-buttons"
            role="toolbar"
            aria-label="Question navigation"
          >
            <button 
              className="back-button"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              type="button"
              aria-label="Previous question"
            >
              Back
            </button>
            <button 
              className="next-button"
              onClick={handleNext}
              disabled={!canProceed}
              type="button"
              aria-label={currentQuestionIndex === questions.length - 1 ? 'Complete assessment' : 'Next question'}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </AssessmentErrorBoundary>
  );
};

export default withFlowValidation<AssessmentProps>(Assessment);
