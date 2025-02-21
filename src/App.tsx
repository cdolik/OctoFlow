import React, { useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import { withFlowValidation, FlowValidationProps, Stage as FlowStage, Responses } from './components/withFlowValidation';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';
import { stages } from './data/stages';

// Define the type for stage data
interface StageData {
  id: FlowStage;
  label: string;
  description: string;
  benchmarks: {
    deploymentFreq: string;
    securityLevel: number;
    costEfficiency: number;
    expectedScores: Record<string, number>;
  };
}

interface AppProps {
  initialStage?: StageData;
  onStepChange?: (responses: Responses) => void;
}

// Base interface for validated components
interface BaseValidatedProps extends FlowValidationProps {
  stage: string;
  onComplete: (responses: Responses) => void;
}

// Component-specific props that extend the base interface
type AssessmentFlowProps = BaseValidatedProps;
type SummaryFlowProps = BaseValidatedProps;
type ResultsFlowProps = BaseValidatedProps;

// Lazy loaded components
const Assessment = lazy(() => import('./components/Assessment'));
const Summary = lazy(() => import('./components/Summary'));
const Results = lazy(() => import('./components/Results'));

// Wrap components with flow validation using their specific prop types
const ValidatedAssessment = withFlowValidation<AssessmentFlowProps>(Assessment);
const ValidatedSummary = withFlowValidation<SummaryFlowProps>(Summary);
const ValidatedResults = withFlowValidation<ResultsFlowProps>(Results);

const App: React.FC<AppProps> = ({ initialStage, onStepChange }) => {
  const [currentStage, setCurrentStage] = useState<StageData | null>(initialStage ?? null);
  const [responses, setResponses] = useState<Responses>({});

  const handleStageSelect = (stageId: FlowStage) => {
    const selectedStage = stages.find(s => s.id === stageId);
    if (selectedStage) {
      setCurrentStage(selectedStage as StageData);
    }
  };

  const handleResponseUpdate = (newResponses: Responses) => {
    setResponses(newResponses);
    onStepChange?.(newResponses);
  };

  const handleComplete = (newResponses: Responses) => {
    handleResponseUpdate(newResponses);
  };

  return (
    <div className="App">
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Hero onStageSelect={(stage: string) => handleStageSelect(stage as FlowStage)} />} />
              <Route path="/stage-select" element={<StageSelector onSelect={(stage: string) => handleStageSelect(stage as FlowStage)} />} />
              <Route
                path="/assessment"
                element={
                  currentStage ? (
                    <ValidatedAssessment
                      stage={currentStage.id}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages.map(s => s.id as FlowStage)}
                      onStepChange={handleResponseUpdate}
                      onComplete={handleComplete}
                    />
                  ) : (
                    <Navigate to="/stage-select" replace />
                  )
                }
              />
              <Route
                path="/summary"
                element={
                  currentStage ? (
                    <ValidatedSummary
                      stage={currentStage.id}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages.map(s => s.id as FlowStage)}
                      onStepChange={handleResponseUpdate}
                      onComplete={handleComplete}
                    />
                  ) : (
                    <Navigate to="/stage-select" replace />
                  )
                }
              />
              <Route
                path="/results"
                element={
                  currentStage ? (
                    <ValidatedResults
                      stage={currentStage.id}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages.map(s => s.id as FlowStage)}
                      onStepChange={handleResponseUpdate}
                      onComplete={handleComplete}
                    />
                  ) : (
                    <Navigate to="/stage-select" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </div>
  );
};

export default App;