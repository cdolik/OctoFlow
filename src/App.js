import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import Assessment from './components/Assessment';
import Summary from './components/Summary';
import Results from './components/Results';
import { withFlowValidation } from './withFlowValidation';
import './App.css';

// Wrap key components with flow validation
const ValidatedAssessment = withFlowValidation(Assessment);
const ValidatedSummary = withFlowValidation(Summary);
const ValidatedResults = withFlowValidation(Results);

function App() {
  const [stage, setStage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStageSelect = (selectedStage) => {
    setStage(selectedStage);
    setCurrentStep(1); // Move to the assessment step
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="App">
      <ErrorBoundary>
        {currentStep === 0 && <Hero onStageSelect={handleStageSelect} />}
        {currentStep === 1 && <StageSelector onStageSelect={handleStageSelect} />}
        {currentStep === 2 && <ValidatedAssessment stage={stage} onStepChange={handleStepChange} />}
        {currentStep === 3 && <ValidatedSummary onStepChange={handleStepChange} />}
        {currentStep === 4 && <ValidatedResults />}
      </ErrorBoundary>
    </div>
  );
}

export default App;
