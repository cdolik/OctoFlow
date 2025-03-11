import React, { useState, useEffect } from 'react';
import { StartupStage, questions } from '../data/questions';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalizationData } from './PersonalizationInputs';
import { trackAssessmentStart, trackAssessmentComplete } from '../utils/analyticsUtils';

interface AssessmentFlowProps {
  stage: StartupStage;
  onComplete: (responses: Record<string, number>, personalizationData?: PersonalizationData) => void;
  onBack: () => void;
  personalizationData?: PersonalizationData;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ 
  stage, 
  onComplete, 
  onBack,
  personalizationData 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
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
  
  // Track assessment start when component mounts
  useEffect(() => {
    trackAssessmentStart(stage, personalizationData);
  }, [stage, personalizationData]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' || 
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      
      // Navigation with arrow keys
      switch (e.key) {
        case 'ArrowLeft':
          if (currentQuestionIndex > 0) {
            e.preventDefault();
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
          }
          break;
          
        case 'ArrowRight':
          if (currentQuestionIndex < stageQuestions.length - 1) {
            e.preventDefault();
            handleSkip();
          }
          break;
          
        case '1':
        case '2':
        case '3':
        case '4':
          // Allow scoring with number keys 1-4
          e.preventDefault();
          handleResponse(parseInt(e.key, 10));
          break;
          
        case 'Escape':
          // Go back with Escape key
          e.preventDefault();
          onBack();
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, stageQuestions.length, handleSkip, handleResponse, onBack]);
  
  const handleResponse = (score: number) => {
    const updatedResponses = { ...responses, [currentQuestion.id]: score };
    setResponses(updatedResponses);
    
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Completed all questions
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // If this is the last question, complete the assessment with the responses so far
      handleComplete();
    }
  };
  
  const toggleTooltip = () => {
    setTooltipVisible(!tooltipVisible);
  };

  const handleComplete = () => {
    // Track completion stats
    const scoreCount = Object.keys(responses).length;
    const totalQuestions = stageQuestions.length;
    
    // Calculate overall score
    const allValues = Object.values(responses);
    const overallScore = allValues.length > 0 
      ? allValues.reduce((a, b) => a + b, 0) / allValues.length 
      : 0;
    
    // Track the assessment completion
    trackAssessmentComplete(stage, scoreCount, totalQuestions, overallScore);
    
    // Call the onComplete callback from parent
    onComplete(responses, personalizationData);
  };

  // Score button descriptive labels for better UX
  const scoreLabels = {
    1: "Not implemented - We haven't addressed this yet",
    2: "Basic implementation - We've started but have more to do",
    3: "Mostly implemented - We're doing well but could improve",
    4: "Fully implemented - We have a robust solution in place"
  };
  
  return (
    <div className="assessment-flow">
      <h2>{stage} Assessment</h2>
      
      <div className="progress-container">
        <div className="progress-stats">
          <span className="progress-text">Question {currentQuestionIndex + 1} of {stageQuestions.length}</span>
          <span className="progress-percentage">{Math.round(progress)}% Complete</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </div>
      
      <motion.div 
        className="question-card"
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <div className="question-meta">
          <span className="question-category">{currentQuestion.category}</span>
        </div>

        <div className="question-header">
          <h3>{currentQuestion.text}</h3>
          <button className="info-button" onClick={toggleTooltip}>
            <span className="info-icon">i</span>
          </button>
        </div>
        
        <AnimatePresence>
          {tooltipVisible && (
            <motion.div 
              className="tooltip"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p>{currentQuestion.tooltipText}</p>
              <a href={currentQuestion.githubDocsUrl} target="_blank" rel="noopener noreferrer">
                Learn more in GitHub Docs
              </a>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="score-buttons">
          {Object.entries(scoreLabels).map(([score, label]) => (
            <motion.button 
              key={score}
              onClick={() => handleResponse(parseInt(score))}
              className={`score-button score-${score}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="score-value">{score}</div>
              <div className="score-description">{label}</div>
            </motion.button>
          ))}
        </div>
        
        <div className="navigation-buttons">
          <motion.button 
            onClick={handlePrevious}
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentQuestionIndex === 0 ? '← Back to Stage Selection' : '← Previous Question'}
          </motion.button>
          
          <motion.button
            onClick={handleSkip}
            className="skip-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip This Question {currentQuestionIndex === stageQuestions.length - 1 ? 'and Finish' : '→'}
          </motion.button>
        </div>
      </motion.div>
      
      {/* Add keyboard shortcut help button */}
      <button 
        className="keyboard-help-button" 
        onClick={() => setShowKeyboardHelp(prev => !prev)}
        aria-label="Keyboard shortcuts help"
      >
        ⌨️
      </button>
      
      {/* Keyboard shortcuts help modal */}
      {showKeyboardHelp && (
        <div className="keyboard-help-modal">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><kbd>←</kbd> Previous question</li>
            <li><kbd>→</kbd> Skip question</li>
            <li><kbd>1</kbd>-<kbd>4</kbd> Select score</li>
            <li><kbd>Esc</kbd> Go back</li>
          </ul>
          <button onClick={() => setShowKeyboardHelp(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AssessmentFlow; 