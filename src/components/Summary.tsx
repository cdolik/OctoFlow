import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Question, Recommendation } from '../types';
import { useStageValidation } from '../hooks/useStageValidation';
import { getStageQuestions } from '../data/categories';
import { saveAssessmentResponses, saveMetricsAndRecommendations } from '../utils/storage';
import { trackCTAClick } from '../utils/analytics';
import GitHubTooltip from './GitHubTooltip';
import AssessmentErrorBoundary from './AssessmentErrorBoundary';
import { calculateStageScores } from '../utils/scoring';
import { stages } from '../data/stages';
import RadarChart from './RadarChart';
import { generateRecommendations } from '../utils/recommendations';

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
  const [tailoredRecommendations, setTailoredRecommendations] = useState<Recommendation[]>([]);
  
  const { isValidating, error, canProgress } = useStageValidation({
    currentStage: stage,
    responses,
    onValidationError: setValidationError
  });
  
  const stageQuestions = getStageQuestions(stage);
  const stageConfig = stages.find(s => s.id === stage);
  const scores = calculateStageScores(stage, responses);
  const meetsThreshold = stageConfig && scores.overallScore >= (stageConfig.scoringCriteria?.threshold || 0);
  
  useEffect(() => {
    const calculateMetrics = () => {
      const totalResponses = Object.keys(responses).length;
      const totalQuestions = stageQuestions.length;
      const totalTime = Object.values(responses).reduce((acc: number, response: any) => {
        return acc + (response.timeSpent || 0);
      }, 0);
      
      setAverageResponseTime(totalResponses > 0 ? totalTime / totalResponses : 0);
      setCompletionRate((totalResponses / totalQuestions) * 100);
    };
    
    calculateMetrics();
    
    // Generate tailored recommendations based on scores
    const recommendations = generateRecommendations(stage, scores);
    setTailoredRecommendations(recommendations);
    
    // Save metrics and recommendations
    saveMetricsAndRecommendations(
      { averageResponseTime, completionRate },
      recommendations.map(r => r.id)
    );
  }, [responses, stageQuestions, stage, scores, averageResponseTime, completionRate]);

  const handleResponseEdit = useCallback(async (questionId: string, value: number) => {
    const newResponses = {
      ...responses,
      [questionId]: value
    };
    
    try {
      const saved = await saveAssessmentResponses(newResponses);
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
  }, [responses, onStepChange]);

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

  const renderRecommendations = () => {
    if (tailoredRecommendations.length === 0) {
      return <p>No recommendations available at this time.</p>;
    }
    
    return (
      <div className="recommendations-list">
        {tailoredRecommendations.slice(0, 3).map((recommendation) => (
          <div key={recommendation.id} className="recommendation-card">
            <h4>{recommendation.title}</h4>
            <p>{recommendation.description}</p>
            <div className="recommendation-meta">
              <span className={`effort-tag effort-${recommendation.effort.toLowerCase()}`}>
                Effort: {recommendation.effort}
              </span>
              <span className="impact-tag">
                Impact: {recommendation.impact}/10
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AssessmentErrorBoundary onRecovery={() => navigate('/stage-select')}>
      <div className="summary-container">
        <h2>Review Your {stage} Assessment</h2>
        
        {!meetsThreshold && (
          <div className="error-message" role="alert">
            Your score is below the required threshold to proceed. You need at least {stageConfig?.scoringCriteria?.threshold} points.
          </div>
        )}
        
        {validationError && (
          <div className="error-message" role="alert">
            {validationError}
          </div>
        )}
        
        <div className="summary-analytics">
          <div className="analytics-section">
            <h3>Key Metrics</h3>
            <div className="metrics-container">
              <div className="metrics-card">
                <div className="metric-value">{completionRate.toFixed(0)}%</div>
                <div className="metric-label">Completion Rate</div>
              </div>
              <div className="metrics-card">
                <div className="metric-value">{averageResponseTime.toFixed(2)}s</div>
                <div className="metric-label">Avg Response Time</div>
              </div>
              <div className="metrics-card highlight">
                <div className="metric-value">{scores.overallScore.toFixed(1)}</div>
                <div className="metric-label">Overall Score</div>
              </div>
            </div>
          </div>
          
          <div className="analytics-section">
            <h3>Category Performance</h3>
            <div className="chart-container">
              {Object.keys(scores.categoryScores).length > 0 && 
                <RadarChart 
                  categories={Object.keys(scores.categoryScores)}
                  values={Object.values(scores.categoryScores)}
                  benchmarks={stageConfig?.benchmarks?.expectedScores || {}}
                />
              }
            </div>
          </div>
        </div>
        
        <div className="recommendations-section">
          <h3>Tailored GitHub Recommendations</h3>
          {renderRecommendations()}
        </div>
        
        <div className="questions-summary">
          <h3>Assessment Responses</h3>
          {stageQuestions.map(renderQuestion)}
        </div>
        
        <div className="summary-actions">
          <button 
            className="secondary-button"
            onClick={() => navigate(`/assessment/${stage}`)}
          >
            Return to Assessment
          </button>
          <button
            className="primary-button"
            disabled={!meetsThreshold || !canProgress}
            onClick={handleViewResults}
          >
            {stage === 'series-b' ? 'Complete Assessment' : 'Proceed to Next Stage'}
          </button>
        </div>
      </div>
    </AssessmentErrorBoundary>
  );
};

export default Summary;
