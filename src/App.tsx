import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Stage } from './types';
import { getAssessmentState } from './utils/storage'; // Fixed import path
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { AppRoutes } from './components/AppRoutes';
import { ErrorProvider } from './contexts/ErrorContext';
import './App.css';

function App() {
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);

  useEffect(() => {
    const state = getAssessmentState();
    if (state?.currentStage) {
      setCurrentStage(state.currentStage);
    }
  }, []);

  const handleStageSelect = (stage: Stage) => {
    setCurrentStage(stage);
  };

  const handleAssessmentComplete = () => {
    // Assessment completion logic handled by route component
  };

  const handleAssessmentError = () => {
    setCurrentStage(null);
  };

  return (
    <ErrorProvider>
      <Router>
        <GlobalErrorBoundary>
          <AppRoutes
            currentStage={currentStage}
            onStageSelect={handleStageSelect}
            onAssessmentComplete={handleAssessmentComplete}
            onAssessmentError={handleAssessmentError}
          />
        </GlobalErrorBoundary>
      </Router>
    </ErrorProvider>
  );
}

export default App;
