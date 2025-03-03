import React, { useState, useEffect } from 'react';
import './App.css';
import StageSelector from './components/StageSelector';
import AssessmentFlow from './components/AssessmentFlow';
import ResultsDashboard from './components/ResultsDashboard';
import { StartupStage } from './data/questions';

enum AppState {
  StageSelection,
  Assessment,
  Results
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.StageSelection);
  const [selectedStage, setSelectedStage] = useState<StartupStage | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  
  // Check if we have any saved state in sessionStorage
  useEffect(() => {
    const savedState = sessionStorage.getItem('octoflow-app-state');
    const savedStage = sessionStorage.getItem('octoflow-selected-stage');
    const savedResponses = sessionStorage.getItem('octoflow-responses');
    
    if (savedState && savedStage) {
      try {
        setAppState(parseInt(savedState, 10));
        setSelectedStage(savedStage as StartupStage);
        
        if (savedResponses) {
          setResponses(JSON.parse(savedResponses));
        }
      } catch (e) {
        console.error('Failed to restore saved state', e);
      }
    }
  }, []);
  
  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (selectedStage) {
      sessionStorage.setItem('octoflow-app-state', appState.toString());
      sessionStorage.setItem('octoflow-selected-stage', selectedStage);
      
      if (Object.keys(responses).length > 0) {
        sessionStorage.setItem('octoflow-responses', JSON.stringify(responses));
      }
    }
  }, [appState, selectedStage, responses]);
  
  const handleStageSelect = (stage: StartupStage) => {
    setSelectedStage(stage);
    setAppState(AppState.Assessment);
  };
  
  const handleAssessmentComplete = (assessmentResponses: Record<string, number>) => {
    setResponses(assessmentResponses);
    setAppState(AppState.Results);
  };
  
  const handleReset = () => {
    // Clear all session storage
    sessionStorage.removeItem('octoflow-app-state');
    sessionStorage.removeItem('octoflow-selected-stage');
    sessionStorage.removeItem('octoflow-responses');
    
    // Reset state
    setSelectedStage(null);
    setResponses({});
    setAppState(AppState.StageSelection);
  };
  
  const handleBack = () => {
    if (appState === AppState.Assessment) {
      setAppState(AppState.StageSelection);
    } else if (appState === AppState.Results) {
      setAppState(AppState.Assessment);
    }
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>OctoFlow</h1>
        <p>GitHub Practices Assessment for Startups</p>
      </header>
      
      <main className="app-content">
        {appState === AppState.StageSelection && (
          <StageSelector onSelectStage={handleStageSelect} />
        )}
        
        {appState === AppState.Assessment && selectedStage && (
          <AssessmentFlow 
            stage={selectedStage} 
            onComplete={handleAssessmentComplete} 
            onBack={handleBack}
          />
        )}
        
        {appState === AppState.Results && selectedStage && (
          <ResultsDashboard 
            stage={selectedStage}
            responses={responses}
            onReset={handleReset}
          />
        )}
      </main>
      
      <footer className="app-footer">
        <p>OctoFlow - GitHub Practices Assessment Tool © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
