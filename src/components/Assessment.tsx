import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Question } from '../types';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { useStageTransition } from '../hooks/useStageTransition';
import { getStageQuestions } from '../utils/questionFilters';
import { saveAssessmentResponses } from '../utils/storage';
import { stages } from '../data/stages';
import { questions } from '../data/questions';
import LoadingSpinner from './LoadingSpinner';
import StageTransition from './StageTransition';

interface AssessmentProps {
  stage: Stage;
  responses: Record<string, number>;
  onComplete?: (stage: Stage) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ stage, responses: initialResponses, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stageQuestions, setStageQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>(initialResponses);
  const [saveError, setSaveError] = useState<string | null>(null);

  const stageDef = stages.find(s => s.id === stage);

  const {
    isLoading,
    error: sessionError,
    clearSession
  } = useAssessmentSession({
    redirectPath: '/stage-select',
    autoRecover: true,
    onRecoveryComplete: (recoveredStage, recoveredResponses) => {
      if (recoveredStage === stage) {
        setResponses(recoveredResponses);
        const lastAnswered = Object.keys(recoveredResponses).length;
        setCurrentQuestionIndex(Math.min(lastAnswered, stageQuestions.length - 1));
      }
    }
  });

  const { isTransitioning, progress } = useStageTransition({
    currentStage: stage,
    responses,
    onTransitionComplete: () => onComplete?.(stage)
  });

  useEffect(() => {
    const filteredQuestions = getStageQuestions(stage, questions);
    setStageQuestions(filteredQuestions);
  }, [stage]);

  const handleAnswer = useCallback(async (value: number) => {
    if (!currentQuestion) return;

    const newResponses = {
      ...responses,
      [currentQuestion.id]: value
    };
    setResponses(newResponses);

    // Attempt to save responses
    try {
      const saved = await saveAssessmentResponses(newResponses, stage);
      if (!saved) {
        setSaveError('Failed to save response. Your progress may not be preserved.');
      } else {
        setSaveError(null);
      }
    } catch (error) {
      setSaveError('Error saving response. Please try again.');
      return;
    }

    // Auto-advance to next question
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestion, responses, stage, currentQuestionIndex, stageQuestions.length]);

  const currentQuestion = stageQuestions[currentQuestionIndex];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (sessionError) {
    return (
      <div className="error-container">
        <h2>Session Error</h2>
        <p>{sessionError.message}</p>
        <button onClick={clearSession}>Start New Session</button>
      </div>
    );
  }

  if (isTransitioning) {
    return (
      <StageTransition
        fromStage={stage}
        toStage={stage}
        progress={progress}
      />
    );
  }

  if (!stageDef) {
    return (
      <div className="error-container">
        <h2>Configuration Error</h2>
        <p>Invalid stage configuration.</p>
        <button onClick={() => window.location.href = '/stage-select'}>
          Return to Stage Selection
        </button>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      <div className="stage-indicator">
        <h2>{stageDef.label}</h2>
        <div className="stage-focus">
          Focus Areas: {stageDef.focus.join(', ')}
        </div>
      </div>

      {saveError && (
        <div className="error-message" role="alert">
          {saveError}
        </div>
      )}

      <div className="question-container">
        {currentQuestion && (
          <div className="question">
            <h3>{currentQuestion.text}</h3>
            <div className="options">
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={responses[currentQuestion.id] === option.value ? 'selected' : ''}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress"
            style={{ width: `${(currentQuestionIndex / stageQuestions.length) * 100}%` }}
          />
        </div>
        <div className="progress-stats">
          <span>Question {currentQuestionIndex + 1} of {stageQuestions.length}</span>
          <span>{Math.round((currentQuestionIndex / stageQuestions.length) * 100)}% Complete</span>
        </div>
      </div>
    </div>
  );
};

export default Assessment;