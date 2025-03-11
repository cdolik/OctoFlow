import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage } from '../types';
import { loadState, saveState } from '../utils/storage';
import { getQuestionsByStage } from '../data/questions';
import ProgressBar from './ProgressBar';
import { withPerformanceTracking, usePerformanceTracking } from '../utils/performance';

interface AssessmentProps {
  stage: Stage;
  onComplete?: () => void;
}

const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  usePerformanceTracking('Assessment');
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { value: boolean; timestamp: number }>>({});
  
  const stageQuestions = getQuestionsByStage(Stage.Assessment);
  
  // Add performance tracking for state loading
  useEffect(() => {
    const loadStateWithPerf = async () => {
      const startTime = performance.now();
      try {
        const savedState = loadState();
        if (savedState && savedState.responses) {
          setResponses(savedState.responses);
        }
        const loadTime = performance.now() - startTime;
        if (loadTime > 100) { // Log if loading takes more than 100ms
          console.debug(`[Performance] State loading took ${loadTime.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Failed to load state:', error);
      }
    };
    loadStateWithPerf();
  }, []);
  
  // Add performance tracking for state saving
  useEffect(() => {
    const saveStateWithPerf = async () => {
      const startTime = performance.now();
      if (Object.keys(responses).length > 0) {
        try {
          saveState({ 
            currentStage: Stage.Assessment,
            responses
          });
          const saveTime = performance.now() - startTime;
          if (saveTime > 50) { // Log if saving takes more than 50ms
            console.debug(`[Performance] State saving took ${saveTime.toFixed(2)}ms`);
          }
        } catch (error) {
          console.error('Failed to save state:', error);
        }
      }
    };
    saveStateWithPerf();
  }, [responses]);
  
  const handleAnswer = (value: boolean) => {
    const currentQuestion = stageQuestions[currentQuestionIndex];
    
    // Record response with timestamp
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        value,
        timestamp: Date.now()
      }
    }));
    
    // Move to next question or complete
    if (currentQuestionIndex < stageQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleComplete = () => {
    // Save final state
    saveState({
      currentStage: Stage.Results,
      responses
    });
    
    // Call onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
    
    // Navigate to results page
    navigate('/results');
  };
  
  // Handle case with no questions
  if (stageQuestions.length === 0) {
    return (
      <div className="assessment-empty p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">No questions available</h1>
        <button 
          onClick={() => navigate('/')} 
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const currentQuestion = stageQuestions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / stageQuestions.length) * 100);
  
  return (
    <div className="assessment-container max-w-2xl mx-auto p-6" role="main" aria-labelledby="question-title">
      <ProgressBar 
        progress={progress} 
        label="Assessment progress"
        customText={`Question ${currentQuestionIndex + 1} of ${stageQuestions.length}`}
      />
      
      <div className="question-card bg-white p-6 rounded-lg shadow-md">
        <h2 id="question-title" className="text-xl font-medium mb-6">{currentQuestion.text}</h2>
        
        <div className="answers-container space-y-4" role="radiogroup" aria-labelledby="question-title">
          <button
            onClick={() => handleAnswer(true)}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            aria-label="Answer Yes"
            role="radio"
            aria-checked="false"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAnswer(true);
              }
            }}
          >
            Yes
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            aria-label="Answer No"
            role="radio"
            aria-checked="false"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAnswer(false);
              }
            }}
          >
            No
          </button>
        </div>
      </div>
      
      <div className="my-4 p-4 bg-white rounded shadow-md">
        <div className="text-center">
          <div className="navigation mt-6 flex justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline"
            >
              Cancel Assessment
            </button>
            
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="text-blue-600 hover:underline"
              >
                Previous Question
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with performance tracking
export default withPerformanceTracking(Assessment, 'Assessment');
