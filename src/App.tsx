import React, { useState, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import { withFlowValidation, FlowValidationProps, Stage, Responses } from './components/withFlowValidation';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

export interface StageConfig {
  id: Stage;
  label: string;
  description: string;
  toUpperCase: () => string;
  benchmarks: {
    deploymentFreq: string;
    securityLevel: number;
    costEfficiency: number;
    expectedScores: Record<string, number>;
  };
}

interface AppProps {
  initialStage?: StageConfig;
  onStepChange?: (responses: Responses) => void;
}

// Extend base props for different component needs
interface AssessmentFlowProps extends FlowValidationProps {
  stage: StageConfig;
  onComplete: (responses: Responses) => void;
  onStepChange: (responses: Responses) => void;
}

interface SummaryFlowProps extends FlowValidationProps {
  stage: StageConfig;
  onStepChange: (responses: Responses) => void;
}

interface ResultsFlowProps extends FlowValidationProps {
  stage: StageConfig;
  onStepChange: (responses: Responses) => void;
}

const Assessment = lazy(() => import('./components/Assessment'));
const Summary = lazy(() => import('./components/Summary'));
const Results = lazy(() => import('./components/Results'));

const ValidatedAssessment = withFlowValidation<AssessmentFlowProps>(Assessment);
const ValidatedSummary = withFlowValidation<SummaryFlowProps>(Summary);
const ValidatedResults = withFlowValidation<ResultsFlowProps>(Results);

const App: React.FC<AppProps> = ({ initialStage, onStepChange }) => {
  const [currentStage, setCurrentStage] = useState<StageConfig | null>(initialStage ?? null);
  const [responses, setResponses] = useState<Responses>({});

  const handleStageSelect = (selectedStage: Stage) => {
    setCurrentStage({
      id: selectedStage,
      label: selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1),
      description: `${selectedStage} stage assessment`,
      toUpperCase: () => selectedStage.toUpperCase(),
      benchmarks: {
        deploymentFreq: 'weekly',
        securityLevel: 1,
        costEfficiency: 1,
        expectedScores: {}
      }
    });
  };

  const handleComplete = (finalResponses: Responses) => {
    setResponses(finalResponses);
    onStepChange?.(finalResponses);
  };

  const handleResponseChange = (newResponses: Responses) => {
    setResponses(newResponses);
    onStepChange?.(newResponses);
  };

  const stages: Stage[] = ['pre-seed', 'seed', 'series-a'];

  return (
    <div className="App">
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Hero onStageSelect={(stage: string) => handleStageSelect(stage as Stage)} />} />
              <Route path="/stage-select" element={<StageSelector onStageSelect={(stage: string) => handleStageSelect(stage as Stage)} />} />
              <Route
                path="/assessment"
                element={
                  currentStage ? (
                    <ValidatedAssessment
                      stage={currentStage}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages}
                      onStepChange={handleResponseChange}
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
                      stage={currentStage}
                      currentStage={currentStage.id}
                      responses={responses}
                      stages={stages}
                      onStepChange={handleResponseChange}
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
                      stages={stages}
                      onStepChange={handleResponseChange}
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

