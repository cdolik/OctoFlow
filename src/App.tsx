import React, { useState, useCallback } from 'react';
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
import { useStageValidation } from './hooks/useStageValidation';

interface AppProps {
  initialStage?: Stage;
  onStepChange?: (responses: Responses) => void;
}

const App: React.FC<AppProps> = ({ initialStage, onStepChange }) => {
  const [currentStage, setCurrentStage] = useState<Stage | null>(initialStage ?? null);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const { error: validationError } = useStageValidation({
    currentStage,
    responses
  });

  const handleStageSelect = useCallback((stage: Stage) => {
    setCurrentStage(stage);
  }, []);

  const handleResponseChange = useCallback((newResponses: Record<string, number>) => {
    setResponses(newResponses);
    onStepChange?.(newResponses);
  }, [onStepChange]);

  const renderProtectedRoute = (
    Component: React.ComponentType<any>,
    props: Record<string, any>
  ) => {
    if (!currentStage) {
      return <Navigate to="/stage-select" replace />;
    }

    if (validationError) {
      return <Navigate to="/stage-select" state={{ error: validationError }} replace />;
    }

    return (
      <AssessmentErrorBoundary
        key={`${currentStage}-${Component.name}`}
        onRecovery={() => handleStageSelect(currentStage)}
      >
        <Component
          stage={currentStage}
          responses={responses}
          stages={stages.map(s => s.id)}
          onStepChange={handleResponseChange}
          {...props}
        />
      </AssessmentErrorBoundary>
    );
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
            element={renderProtectedRoute(Assessment, {})}
          />
          <Route
            path="/summary"
            element={renderProtectedRoute(Summary, {})}
          />
          <Route
            path="/results"
            element={renderProtectedRoute(Results, {})}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GlobalErrorBoundary>
    </Router>
  );
};

export default App;
