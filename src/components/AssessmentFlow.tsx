import React, { useState, useEffect } from 'react';
import { Question, StartupStage, questions } from '../data/questions';

interface AssessmentFlowProps {
  stage: StartupStage;
  onComplete: (responses: Record<string, number>) => void;
  onBack: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ stage, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const stageQuestions = questions[stage];
  const currentQuestion = stageQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / stageQuestions.length) * 100;
  
  // Load saved responses from sessionStorage if available
  useEffect(() => {
    const savedResponses = sessionStorage.getItem(`octoflow-responses-${stage}`);
    if (savedResponses) {
      try {
        setResponses(JSON.parse(savedResponses));
      } catch (e) {
        console.error('Failed to parse saved responses', e);
      }
    }
  }, [stage]);
  
  // Save responses to sessionStorage when they change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      sessionStorage.setItem(`octoflow-responses-${stage}`, JSON.stringify(responses));
    }
  }, [responses, stage]);
  
  const handleResponse = (score: number) => {
    const updatedResponses = { ...responses, [currentQuestion.id]: score };
    setResponses(updatedResponses);
    
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Completed all questions
      onComplete(updatedResponses);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };
  
  const toggleTooltip = () => {
    setTooltipVisible(!tooltipVisible);
  };
  
  return (
    <div className="assessment-flow">
      <h2>{stage} Assessment</h2>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">Question {currentQuestionIndex + 1} of {stageQuestions.length}</span>
      </div>
      
      <div className="question-card">
        <div className="question-header">
          <h3>{currentQuestion.text}</h3>
          <button className="info-button" onClick={toggleTooltip}>i</button>
        </div>
        
        {tooltipVisible && (
          <div className="tooltip">
            <p>{currentQuestion.tooltipText}</p>
            <a href={currentQuestion.githubDocsUrl} target="_blank" rel="noopener noreferrer">
              Learn more in GitHub Docs
            </a>
          </div>
        )}
        
        <div className="question-category">Category: {currentQuestion.category}</div>
        
        <div className="score-buttons">
          <button onClick={() => handleResponse(1)}>1 - Not Implemented</button>
          <button onClick={() => handleResponse(2)}>2 - Basic Implementation</button>
          <button onClick={() => handleResponse(3)}>3 - Mostly Implemented</button>
          <button onClick={() => handleResponse(4)}>4 - Fully Implemented</button>
        </div>
        
        <div className="navigation-buttons">
          <button onClick={handlePrevious}>
            {currentQuestionIndex === 0 ? 'Back to Stage Selection' : 'Previous Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentFlow; 