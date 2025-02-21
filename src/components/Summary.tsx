import React from 'react';
import GitHubTooltip from './GitHubTooltip';
import { getAssessmentResponses } from '../utils/storage';
import { getStageQuestions } from '../data/categories';
import { FlowValidationProps } from './withFlowValidation';
import './styles.css';

interface Option {
  value: number;
  text: string;
}

interface Recommendation {
  text: string;
  link: string;
}

interface Question {
  id: string;
  text: string;
  tooltipTerm?: string;
  textAfter?: string;
  stages: string[];
  options: Option[];
  recommendation?: Recommendation;
}

interface Category {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: Question[];
}

interface QuestionResponse {
  score: number;
  label: string;
  recommendation?: Recommendation;
}

interface SummaryProps extends FlowValidationProps {
  stage: import('../App').StageConfig;
  onStepChange: (responses: Record<string, number>) => void;
}

export const Summary: React.FC<SummaryProps> = ({ stage, onStepChange }) => {
  const responses = getAssessmentResponses() as Record<string, number>;
  const stageCategories = getStageQuestions(stage.id) as Category[];

  const getCategoryQuestions = (categoryId: string): Question[] => {
    const category = stageCategories.find((c: Category) => c.id === categoryId);
    return category ? category.questions : [];
  };

  const getQuestionResponse = (questionId: string): QuestionResponse | null => {
    const response = responses[questionId];
    if (typeof response === 'undefined') return null;

    for (const category of stageCategories) {
      const question = category.questions.find((q: Question) => q.id === questionId);
      if (question) {
        const option = question.options.find((opt: Option) => opt.value === response);
        return {
          score: response,
          label: option?.text || 'Unknown',
          recommendation: question.recommendation
        };
      }
    }
    return null;
  };

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h2>Review Your Responses</h2>
        <div className="stage-badge">{stage.id} Stage</div>
      </div>
      
      {stageCategories.map((category: Category) => (
        <div key={category.id} className="category-summary">
          <div className="category-header">
            <h3>{category.title}</h3>
            <GitHubTooltip term={category.id}>
              <span className="category-weight">Weight: {category.weight}</span>
            </GitHubTooltip>
          </div>
          {getCategoryQuestions(category.id).map(question => {
            const response = getQuestionResponse(question.id);
            return (
              <div key={question.id} className="response-review">
                <div className="question-text">
                  {question.text}
                  {question.tooltipTerm && (
                    <GitHubTooltip term={question.tooltipTerm}>
                      <span className="tooltip-trigger">{question.tooltipTerm}</span>
                    </GitHubTooltip>
                  )}
                  {question.textAfter}
                </div>
                {response ? (
                  <div className="answer-display">
                    <div className="answer-score">Score: {response.score}/4</div>
                    <div className="selected-answer">{response.label}</div>
                    {response.score < 3 && response.recommendation && (
                      <a 
                        href={response.recommendation.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="recommendation-link"
                      >
                        {response.recommendation.text} →
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="no-answer">No response provided</div>
                )}
                <button 
                  onClick={() => onStepChange(responses)}
                  className="edit-button"
                >
                  Edit Response
                </button>
              </div>
            );
          })}
        </div>
      ))}
      
      <div className="summary-actions">
        <button 
          onClick={() => onStepChange(responses)} 
          className="back-button"
        >
          Back to Assessment
        </button>
        <button 
          onClick={() => onStepChange(responses)}
          className="next-button"
        >
          View Results →
        </button>
      </div>
    </div>
  );
}

export default Summary;