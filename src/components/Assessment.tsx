import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Question } from '../types';
import { useStageManager } from '../hooks/useStageManager';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useStorage } from '../hooks/useStorage';
import { filterQuestionsByStage } from '../utils/questionFiltering';
import { questions } from '../data/questions';
import LoadingSpinner from './LoadingSpinner';
import ErrorFallback from './ErrorFallback';

interface AssessmentProps {
  stage: Stage;
  onStepChange?: (responses: Record<string, number>) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ stage, onStepChange }) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const {
    state,
    saveState,
    isLoading: storageLoading
  } = useStorage({
    autoSave: true,
    backupInterval: 5 * 60 * 1000 // 5 minutes
  });

  const {
    isTransitioning,
    error: stageError,
    transition
  } = useStageManager({
    onStageComplete: () => navigate('/summary')
  });

  const {
    handleError,
    activeErrorCount,
    isHandlingError
  } = useErrorManagement({
    stage,
    onUnrecoverableError: () => navigate('/stage-select')
  });

  const stageQuestions = filterQuestionsByStage(questions, stage);

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      try {
        await transition('summary');
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to transition'));
      }
    }
  }, [currentQuestionIndex, stageQuestions.length, transition, handleError]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleAnswer = useCallback(async (value: number) => {
    const currentQuestion = stageQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const newResponses = {
        ...state?.responses,
        [currentQuestion.id]: value
      };

      await saveState({
        ...state,
        responses: newResponses
      });

      onStepChange?.(newResponses);
      handleNext();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to save response'));
    }
  }, [currentQuestionIndex, stageQuestions, state, saveState, onStepChange, handleNext, handleError]);

  const { shortcuts, isDisabled } = useKeyboardNavigation({
    stage,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onEscape: () => navigate('/stage-select'),
    disabled: isHandlingError || isTransitioning,
    shortcuts: [
      {
        key: '1',
        description: 'Select first option',
        action: () => handleAnswer(1)
      },
      {
        key: '2',
        description: 'Select second option',
        action: () => handleAnswer(2)
      },
      {
        key: '3',
        description: 'Select third option',
        action: () => handleAnswer(3)
      },
      {
        key: '4',
        description: 'Select fourth option',
        action: () => handleAnswer(4)
      }
    ]
  });

  if (storageLoading) {
    return <LoadingSpinner />;
  }

  if (stageError || activeErrorCount > 0) {
    return (
      <ErrorFallback
        error={stageError || new Error('Assessment error')}
        resetError={() => window.location.reload()}
      />
    );
  }

  const currentQuestion = stageQuestions[currentQuestionIndex];

  return (
    <div className="assessment-container" role="main">
      <div className="progress-bar">
        <div 
          className="progress"
          style={{ width: `${(currentQuestionIndex / stageQuestions.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={(currentQuestionIndex / stageQuestions.length) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {currentQuestion && (
        <div className="question-container">
          <h2 id="question-title">{currentQuestion.text}</h2>
          <div 
            className="options"
            role="radiogroup"
            aria-labelledby="question-title"
          >
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={state?.responses?.[currentQuestion.id] === option.value ? 'selected' : ''}
                disabled={isDisabled}
                aria-checked={state?.responses?.[currentQuestion.id] === option.value}
                role="radio"
              >
                <span className="option-number">{index + 1}</span>
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="navigation-help">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          {shortcuts.map(shortcut => (
            <li key={shortcut.key}>
              <kbd>{shortcut.key}</kbd> - {shortcut.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Assessment;
