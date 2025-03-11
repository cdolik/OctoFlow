import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import './App.css';
import './styles/Assessment.css';
import './styles/Results.css';
import './styles/Skeleton.css';
import './styles/ErrorBoundary.css';
import StageSelector from './components/StageSelector';
import AssessmentFlow from './components/AssessmentFlow';
import ResultsDashboard from './components/ResultsDashboard';
import FeedbackForm from './components/FeedbackForm';
import GitHubOAuth from './components/GitHubOAuth';
import GitHubDashboard from './components/GitHubDashboard';
import PRInsightsDashboard from './components/PRInsightsDashboard';
import { GitHubProvider, useGitHub } from './contexts/GitHubContext';
import { StartupStage } from './data/questions';
import { GitHubUser } from './types/github';
import './styles/GitHubOAuth.css';
import { PersonalizationData } from './components/PersonalizationInputs';
import ErrorBoundary from './components/ErrorBoundary';
// Import the GitHub logo
import logo from './assets/github-logo.svg';
import {
  saveCurrentStage,
  saveStageResponses,
  savePersonalizationData,
  saveCurrentView,
  getAllStageResponses,
  getCurrentStage,
  getPersonalizationData,
  getCurrentView,
  clearAllStorageData,
  hasExistingAssessmentData
} from './utils/storageUtils';

// Get the base path for GitHub Pages
const basename = process.env.PUBLIC_URL || '';

// Component that wraps our main content and provides access to navigation
function AppContent() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, login } = useGitHub();
  const [menuOpen, setMenuOpen] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | undefined>(undefined);
  const [currentStage, setCurrentStage] = useState<StartupStage>(StartupStage.Beginner);
  const [currentView, setCurrentView] = useState<string>('home');
  const [stageResponses, setStageResponses] = useState<Record<StartupStage, Record<string, number>>>({
    [StartupStage.Beginner]: {},
    [StartupStage.Intermediate]: {},
    [StartupStage.Advanced]: {}
  });
  
  // Load saved state from storage on component mount
  useEffect(() => {
    // Check if there is existing assessment data
    if (hasExistingAssessmentData()) {
      // Load responses
      const savedResponses = getAllStageResponses();
      if (Object.keys(savedResponses).length > 0) {
        setStageResponses(savedResponses);
      }
      
      // Load current stage
      const savedStage = getCurrentStage();
      if (savedStage) {
        setCurrentStage(savedStage);
      }
      
      // Load personalization data
      const savedPersonalizationData = getPersonalizationData();
      if (savedPersonalizationData) {
        setPersonalizationData(savedPersonalizationData);
      }
      
      // Load current view
      const savedView = getCurrentView();
      if (savedView) {
        setCurrentView(savedView);
        
        // Navigate to the appropriate route based on saved view
        switch (savedView) {
          case 'assessment':
            navigate('/assessment');
            break;
          case 'results':
            navigate('/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [navigate]);
  
  // Save state changes to storage
  useEffect(() => {
    saveCurrentStage(currentStage);
    saveCurrentView(currentView);
  }, [currentStage, currentView]);
  
  // Stage selection handler
  const handleStageSelect = (stage: StartupStage, personalizationData?: PersonalizationData) => {
    setCurrentStage(stage);
    setCurrentView('assessment');
    
    if (personalizationData) {
      setPersonalizationData(personalizationData);
      savePersonalizationData(personalizationData);
    }
    
    navigate('/assessment');
  };
  
  // Assessment completion handler
  const handleAssessmentComplete = (assessmentResponses: Record<string, number>, personalizationData?: PersonalizationData) => {
    // Update responses for the current stage
    const updatedResponses = {
      ...stageResponses,
      [currentStage]: assessmentResponses
    };
    
    setStageResponses(updatedResponses);
    saveStageResponses(currentStage, assessmentResponses);
    
    // Update personalization data if provided
    if (personalizationData) {
      setPersonalizationData(personalizationData);
      savePersonalizationData(personalizationData);
    }
    
    setCurrentView('results');
    navigate('/dashboard');
  };
  
  // Reset handler
  const handleReset = () => {
    setCurrentStage(StartupStage.Beginner);
    setStageResponses({
      [StartupStage.Beginner]: {},
      [StartupStage.Intermediate]: {},
      [StartupStage.Advanced]: {}
    });
    setPersonalizationData(undefined);
    setCurrentView('home');
    
    // Clear storage
    clearAllStorageData();
    
    navigate('/');
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  const handleLoginSuccess = (userData: GitHubUser) => {
    login(userData);
    navigate('/dashboard');
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      
      <div className="app-container">
        <header className="app-header">
          <div className="logo-container">
            <Link to="/" className="app-logo-link">
              <img src={logo} alt="GitHub Logo" className="github-logo" />
              <h1>OctoFlow</h1>
            </Link>
            <span className="unofficial-badge">Unofficial</span>
          </div>
          
          <nav className="app-nav">
            <button 
              className="nav-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            
            <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
              <Link to="/" className="nav-button" onClick={() => setMenuOpen(false)}>Home</Link>
              {Object.values(stageResponses).some(responses => Object.keys(responses).length > 0) && (
                <Link to="/dashboard" className="nav-button" onClick={() => setMenuOpen(false)}>Results</Link>
              )}
              <button className="github-button" onClick={login} disabled={isAuthenticated}>
                {isAuthenticated ? 'Connected to GitHub' : 'Connect GitHub'}
              </button>
            </div>
          </nav>
        </header>
        
        <main id="main-content" className="app-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={
              <StageSelector 
                onSelectStage={handleStageSelect} 
                initialData={personalizationData}
              />
            } />
            
            <Route path="/assessment" element={
              currentStage ? (
                <AssessmentFlow 
                  stage={currentStage} 
                  onComplete={handleAssessmentComplete} 
                  onBack={handleBack}
                  personalizationData={personalizationData}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } />
            
            <Route path="/dashboard" element={
              Object.values(stageResponses).some(responses => Object.keys(responses).length > 0) ? (
                <>
                  <ResultsDashboard 
                    stage={currentStage}
                    allResponses={stageResponses}
                    onReset={handleReset}
                    personalizationData={personalizationData}
                  />
                  <FeedbackForm />
                </>
              ) : (
                <Navigate to="/" replace />
              )
            } />
            
            <Route 
              path="/auth"
              element={
                <GitHubOAuth
                  clientId={GITHUB_CLIENT_ID}
                  onLoginSuccess={handleLoginSuccess}
                />
              }
            />
            
            <Route path="/login" element={
              !isAuthenticated ? (
                <GitHubLogin onLoginSuccess={handleLoginSuccess} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } />
            
            <Route path="/dashboard" element={
              isAuthenticated ? (
                <GitHubDashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            } />
            
            <Route path="/pr-insights" element={<PRInsightsDashboard />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>OctoFlow - GitHub Practices Assessment Tool © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
}

function App() {
  return (
    <Router basename={basename}>
      <ErrorBoundary>
        <GitHubProvider>
          <div className="App">
            <div className="main-disclaimer-banner">
              This is an unofficial application and is not affiliated with, sponsored by, or endorsed by GitHub, Inc.
            </div>
            <AppContent />
          </div>
        </GitHubProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
