import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import { withFlowValidation } from './withFlowValidation';
import './App.css';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const Assessment = lazy(() => import('./components/Assessment'));
const Summary = lazy(() => import('./components/Summary'));
const Results = lazy(() => import('./components/Results'));

// Wrap key components with flow validation
const ValidatedAssessment = withFlowValidation(Assessment);
const ValidatedSummary = withFlowValidation(Summary);
const ValidatedResults = withFlowValidation(Results);

function App() {
  const [stage, setStage] = useState(null);

  const handleStageSelect = (selectedStage) => {
    setStage(selectedStage);
  };

  return (
    <div className="App">
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Hero onStageSelect={handleStageSelect} />} />
              <Route path="/stage-select" element={<StageSelector onStageSelect={handleStageSelect} />} />
              <Route path="/assessment" element={
                stage ? 
                <ValidatedAssessment stage={stage} /> : 
                <Navigate to="/stage-select" replace />
              } />
              <Route path="/summary" element={<ValidatedSummary />} />
              <Route path="/results" element={<ValidatedResults />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;
