import React, { useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import { withFlowValidation, FlowValidationProps, Stage as FlowStage, Responses } from './components/withFlowValidation';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';
import { stages } from './data/stages';

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

type AppFlowProps = FlowValidationProps & {
  stage: StageData;
};

const Assessment = lazy(() => import('./components/Assessment'));
const Summary = lazy(() => import('./components/Summary'));
const Results = lazy(() => import('./components/Results'));

const ValidatedAssessment = withFlowValidation<AppFlowProps>(Assessment);
const ValidatedSummary = withFlowValidation<AppFlowProps>(Summary);
const ValidatedResults = withFlowValidation<AppFlowProps>(Results);

const App: React.FC<AppProps> = ({ initialStage, onStepChange }) => {
  const [currentStage, setCurrentStage] = useState<StageData | null>(initialStage ?? null);
  const [responses, setResponses] = useState<Responses>({});

  const handleStageSelect = (selectedStage: StageData) => {
    setCurrentStage(selectedStage);
  };

  const handleResponseUpdate = (newResponses: Responses) => {
    setResponses(newResponses);
    onStepChange?.(newResponses);
  };

  return (
    <div className="App">
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Hero onSelect={handleStageSelect} />} />
              <Route path="/stage-select" element={<StageSelector onSelect={handleStageSelect} />} />
              <Route
                path="/assessment"
                element={
                  currentStage ? (
                    <ValidatedAssessment
                      stage={currentStage}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages.map(s => s.id as FlowStage)}
                      onStepChange={handleResponseUpdate}
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
                      stage={currentStage}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages.map(s => s.id as FlowStage)}
                      onStepChange={handleResponseUpdate}
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
                      stage={currentStage}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages.map(s => s.id as FlowStage)}
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
