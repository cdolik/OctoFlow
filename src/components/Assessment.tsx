import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage } from '../types';
import { getStageQuestions } from '../data/questions';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useStageTransition } from '../hooks/useStageTransition';
import GitHubTooltip from './GitHubTooltip';
import ProgressTracker from './ProgressTracker';
import AutoSave from './AutoSave';
import LoadingSpinner from './LoadingSpinner';
import './styles.css';

interface AssessmentProps {
  stage: Stage;
  onComplete?: (responses: Record<string, number>) => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ stage, onComplete }) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  // Use our enhanced session management
  const {
    isLoading,
    recoveredResponses,
    error: sessionError,
    restoreSession,
    clearSession
  } = useAssessmentSession({
    redirectPath: '/stage-select',
    autoRecover: true,
    onRecoveryComplete: (recoveredStage, responses) => {
      if (recoveredStage === stage) {
        setResponses(responses);
        // Find last answered question
        const questions = getStageQuestions(stage);
        const lastAnswered = questions.findIndex(q => !responses[q.id]);
        setCurrentQuestionIndex(lastAnswered === -1 ? questions.length - 1 : lastAnswered);
      }
    }
  });

  const { startTransition } = useStageTransition({
    stage,
    responses,
    onComplete
  });

  const questions = useMemo(() => getStageQuestions(stage), [stage]);
  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      startTransition('summary');
      navigate('/summary');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSelect = (optionIndex: number) => {
    if (currentQuestion) {
      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: currentQuestion.options[optionIndex].value
      }));
    }
  };

  // Keyboard navigation setup
  useKeyboardNavigation({
    onNext: handleNext,
    onBack: handleBack,
    onSelect: handleSelect,
    shortcuts: [
      {
        key: 'R',
        requiresCtrl: true,
        action: restoreSession
      },
      {
        key: 'Escape',
        action: () => navigate('/stage-select')
      }
    ]
  });

  if (isLoading) {
    return (
      <div className="assessment-loading">
        <LoadingSpinner />
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="assessment-error">
        <h2>Session Error</h2>
        <p>{sessionError.message}</p>
        <button onClick={() => {
          clearSession();
          navigate('/stage-select');
        }}>
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="assessment">
      <ProgressTracker
        current={currentQuestionIndex + 1}
        total={questions.length}
        responses={responses}
      />

      <div className="question-container">
        <h2>Question {currentQuestionIndex + 1}</h2>
        {currentQuestion && (
          <>
            <div className="question-text">
              {currentQuestion.text}
              {currentQuestion.tooltipTerm && (
                <GitHubTooltip term={currentQuestion.tooltipTerm} />
              )}
            </div>

            <div className="options-grid">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option ${responses[currentQuestion.id] === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(idx)}
                  aria-pressed={responses[currentQuestion.id] === option.value}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="navigation">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!currentQuestion || !responses[currentQuestion.id]}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>

      <AutoSave
        data={responses}
        interval={5000}
        onError={() => {
          // Handle autosave error
          console.error('Autosave failed');
        }}
      />
    </div>
  );
};