import React, { useState, useEffect } from 'react';
import { Stage, Question } from '../types';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { useStageTransition } from '../hooks/useStageTransition';
import { getStageQuestions } from '../utils/questionFilters';
import { stages } from '../data/stages';
import { questions } from '../data/questions';
import LoadingSpinner from './LoadingSpinner';
import StageTransition from './StageTransition';

interface AssessmentProps {
  stageId: Stage;
  onComplete?: (stageId: Stage) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ stageId, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stageQuestions, setStageQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const stage = stages.find(s => s.id === stageId);
  
  const {
    isLoading,
    error: sessionError,
    clearSession
  } = useAssessmentSession({
    redirectPath: '/stage-select',
    autoRecover: true,
    onRecoveryComplete: (recoveredStage, recoveredResponses) => {
      if (recoveredStage === stageId) {
        setResponses(recoveredResponses);
        const lastAnswered = Object.keys(recoveredResponses).length;
        setCurrentQuestionIndex(Math.min(lastAnswered, stageQuestions.length - 1));
      }
    }
  });

  const { isTransitioning, progress } = useStageTransition({
    currentStage: stageId,
    responses,
    onTransitionComplete: () => onComplete?.(stageId)
  });

  useEffect(() => {
    const filteredQuestions = getStageQuestions(stageId, questions);
    setStageQuestions(filteredQuestions);
  }, [stageId]);

  const currentQuestion = stageQuestions[currentQuestionIndex];

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;
    
    const newResponses = {
      ...responses,
      [currentQuestion.id]: value
    };
    setResponses(newResponses);

    // Auto-advance to next question
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

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
        fromStage={stageId}
        toStage={stageId}
        progress={progress}
      />
    );
  }

  return (
    <div className="assessment-container">
      <h2>{stage?.label}</h2>
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
      <div className="progress-bar">
        <div 
          className="progress"
          style={{ width: `${(currentQuestionIndex / stageQuestions.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Assessment;