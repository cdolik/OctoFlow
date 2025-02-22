import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Stage, Responses } from './types';
import Hero from './components/Hero';
import StageSelector from './components/StageSelector';
import Assessment from './components/Assessment';
import Summary from './components/Summary';
import Results from './components/Results';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import AssessmentErrorBoundary from './components/AssessmentErrorBoundary';
import { stages } from './data/stages';

interface AppProps {
  initialStage?: Stage;
  onStepChange?: (responses: Responses) => void;
}

const App: React.FC<AppProps> = ({ initialStage, onStepChange }) => {
  const [currentStage, setCurrentStage] = useState<Stage | null>(initialStage ?? null);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const handleStageSelect = (stage: Stage) => {
    setCurrentStage(stage);
  };

  const handleResponseChange = (newResponses: Record<string, number>) => {
    setResponses(newResponses);
    onStepChange?.(newResponses);
  };

  return (
    <Router>
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/" element={<Hero onSelect={handleStageSelect} />} />
          <Route
            path="/stage-select"
            element={<StageSelector onSelect={handleStageSelect} initialStage={currentStage} />}
          />
          <Route
            path="/assessment"
            element={
              currentStage ? (
                <AssessmentErrorBoundary
                  key={currentStage}
                  onRecovery={() => handleStageSelect(currentStage)}
                >
                  <Assessment
                    stage={currentStage}
                    responses={responses}
                    stages={stages.map(s => s.id as Stage)}
                    onStepChange={handleResponseChange}
                  />
                </AssessmentErrorBoundary>
              ) : (
                <Navigate to="/stage-select" replace />
              )
            }
          />
          <Route
            path="/summary"
            element={
              currentStage ? (
                <AssessmentErrorBoundary
                  key={`summary-${currentStage}`}
                  onRecovery={() => handleStageSelect(currentStage)}
                >
                  <Summary
                    stage={currentStage}
                    responses={responses}
                    stages={stages.map(s => s.id as Stage)}
                    onStepChange={handleResponseChange}
                  />
                </AssessmentErrorBoundary>
              ) : (
                <Navigate to="/stage-select" replace />
              )
            }
          />
          <Route
            path="/results"
            element={
              currentStage ? (
                <AssessmentErrorBoundary
                  key={`results-${currentStage}`}
                  onRecovery={() => handleStageSelect(currentStage)}
                >
                  <Results
                    stage={currentStage}
                    responses={responses}
                    stages={stages.map(s => s.id as Stage)}
                  />
                </AssessmentErrorBoundary>
              ) : (
                <Navigate to="/stage-select" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GlobalErrorBoundary>
    </Router>
  );
};

export default App;
