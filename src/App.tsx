import React, { useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import { withFlowValidation, FlowValidationProps, Stage as FlowStage } from './components/withFlowValidation';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

interface Stage {
  id: FlowStage;
  name: string;
}

interface AppFlowProps extends FlowValidationProps {
  stage: Stage;
  onStepChange?: (step: string) => void;
}

const Assessment: React.FC<AppFlowProps> = ({ stage, onStepChange }) => {
  // Assessment component implementation
};

const Summary = lazy(() => import('./components/Summary'));
const Results = lazy(() => import('./components/Results'));

const ValidatedAssessment = withFlowValidation<AppFlowProps>(Assessment);
const ValidatedSummary = withFlowValidation<AppFlowProps & { onStepChange: (step: string) => void }>(Summary);
const ValidatedResults = withFlowValidation<AppFlowProps>(Results);

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  const handleStageSelect = (selectedStage: Stage) => {
    setStage(selectedStage);
  };

  const handleResponseUpdate = (newResponses: Record<FlowStage, unknown>) => {
    setResponses(newResponses);
  };

  const stages: FlowStage[] = ['pre-seed', 'seed', 'series-a'];

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
                  stage ? (
                    <ValidatedAssessment
                      stage={stage}
                      currentStage={stage.id}
                      responses={responses}
                      stages={stages}
                      onResponseUpdate={handleResponseUpdate}
                    />
                  ) : (
                    <Navigate to="/stage-select" replace />
                  )
                }
              />
              <Route
                path="/summary"
                element={
                  stage ? (
                    <ValidatedSummary
                      stage={stage}
                      currentStage={stage.id}
                      responses={responses}
                      stages={stages}
                    />
                  ) : (
                    <Navigate to="/stage-select" replace />
                  )
                }
              />
              <Route
                path="/results"
                element={
                  stage ? (
                    <ValidatedResults
                      stage={stage}
                      currentStage={stage.id}
                      responses={responses}
                      stages={stages}
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

