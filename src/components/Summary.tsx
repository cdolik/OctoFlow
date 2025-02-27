import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Question, Category } from '../types';
import { useStageValidation } from '../hooks/useStageValidation';
import { getStageQuestions } from '../data/categories';
import { saveAssessmentResponses } from '../utils/storage';
import { trackCTAClick } from '../utils/analytics';
import GitHubTooltip from './GitHubTooltip';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';

interface SummaryProps {
  stage: Stage;
  responses: Record<string, number>;
  onStepChange: (responses: Record<string, number>) => void;
}

const Summary: React.FC<SummaryProps> = ({ stage, responses, onStepChange }) => {
  const navigate = useNavigate();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);

  const { isValidating, error, canProgress } = useStageValidation({
    currentStage: stage,
    responses,
    onValidationError: setValidationError
  });

  const stageQuestions = getStageQuestions(stage);

  useEffect(() => {
    const calculateMetrics = () => {
      const totalResponses = Object.keys(responses).length;
      const totalQuestions = stageQuestions.length;
      const totalTime = Object.values(responses).reduce((acc, response) => acc + response, 0);
      setAverageResponseTime(totalTime / totalResponses);
      setCompletionRate((totalResponses / totalQuestions) * 100);
    };

    calculateMetrics();
  }, [responses, stageQuestions]);

  const handleResponseEdit = useCallback(async (questionId: string, value: number) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };

    try {
      const saved = await saveAssessmentResponses(newResponses, stage);
      if (saved) {
        onStepChange(newResponses);
        setEditingQuestionId(null);
        setValidationError(null);
      } else {
        setValidationError('Failed to save response changes');
      }
    } catch (error) {
      setValidationError('Error updating response');
      console.error('Response update failed:', error);
    }
  }, [responses, stage, onStepChange]);

  const handleViewResults = useCallback(() => {
    if (canProgress) {
      trackCTAClick('view_results');
      navigate('/results');
    }
  }, [canProgress, navigate]);

  const handleEditQuestion = useCallback((questionId: string) => {
    setEditingQuestionId(questionId);
    setValidationError(null);
  }, []);

  const renderQuestion = (question: Question) => {
    const response = responses[question.id];
    const isEditing = editingQuestionId === question.id;

    return (
      <div key={question.id} className="summary-question">
        <div className="question-header">
          <h3>{question.text}</h3>
          {question.tooltipTerm && (
            <GitHubTooltip term={question.tooltipTerm} />
          )}
        </div>

        {isEditing ? (
          <div className="response-edit">
            {question.options.map(option => (
              <button
                key={option.value}
                onClick={() => handleResponseEdit(question.id, option.value)}
                className={response === option.value ? 'selected' : ''}
              >
                {option.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="response-summary">
            <span>Your answer: {question.options.find(o => o.value === response)?.text}</span>
            <button
              onClick={() => handleEditQuestion(question.id)}
              className="edit-button"
            >
              Edit Answer
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <AssessmentErrorBoundary onRecovery={() => navigate('/stage-select')}>
      <div className="summary-container">
        <h2>Review Your Responses</h2>
        
        {validationError && (
          <div className="error-message" role="alert">
            {validationError}
          </div>
        )}

        <div className="questions-summary">
          {stageQuestions.map(renderQuestion)}
        </div>

        <div className="summary-metrics">
          <p>Average Response Time: {averageResponseTime.toFixed(2)} seconds</p>
          <p>Completion Rate: {completionRate.toFixed(2)}%</p>
        </div>

        <div className="summary-actions">
          {error ? (
            <p className="validation-error">{error}</p>
          ) : (
            <button
              onClick={handleViewResults}
              disabled={!canProgress || isValidating}
              className="cta-button"
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </AssessmentErrorBoundary>
  );
};

export default Summary;
