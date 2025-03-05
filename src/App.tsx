import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiMenu, FiX, FiGithub, FiInfo, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import './App.css';
import StageSelector from './components/StageSelector';
import AssessmentFlow from './components/AssessmentFlow';
import ResultsDashboard from './components/ResultsDashboard';
import FeedbackForm from './components/FeedbackForm';
import GitHubLogin from './components/GitHubLogin';
import GitHubOAuth from './components/GitHubOAuth';
import GitHubDashboard from './components/GitHubDashboard';
import { GitHubProvider, useGitHub } from './contexts/GitHubContext';
import { StartupStage } from './data/questions';
import { GitHubUser } from './types/github';
import './styles/GitHubOAuth.css';
import { GITHUB_CLIENT_ID, APP_DISCLAIMER } from './config';
// Import the GitHub logo
import logo from './assets/github-logo.svg';

// Get the base path for GitHub Pages
const basePath = process.env.PUBLIC_URL || '';

// Component that wraps our main content and provides access to navigation
function AppContent() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<StartupStage | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const { isAuthenticated, loading, login } = useGitHub();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Check if we have any saved state in sessionStorage
  useEffect(() => {
    const savedStage = sessionStorage.getItem('octoflow-selected-stage');
    const savedResponses = sessionStorage.getItem('octoflow-responses');
    
    if (savedStage) {
      try {
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
      sessionStorage.setItem('octoflow-selected-stage', selectedStage);
      
      if (Object.keys(responses).length > 0) {
        sessionStorage.setItem('octoflow-responses', JSON.stringify(responses));
      }
    }
  }, [selectedStage, responses]);
  
  const handleStageSelect = (stage: StartupStage) => {
    setSelectedStage(stage);
    navigate('/assessment');
  };
  
  const handleAssessmentComplete = (assessmentResponses: Record<string, number>) => {
    setResponses(assessmentResponses);
    navigate('/results');
  };
  
  const handleReset = () => {
    // Clear all session storage
    sessionStorage.removeItem('octoflow-app-state');
    sessionStorage.removeItem('octoflow-selected-stage');
    sessionStorage.removeItem('octoflow-responses');
    
    // Reset state
    setSelectedStage(null);
    setResponses({});
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
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="app-logo-link">
          <div className="logo-container">
            <img src={logo} alt="GitHub Logo" className="github-logo" />
            <h1>OctoFlow</h1>
            <div className="unofficial-badge">Unofficial</div>
          </div>
        </Link>
        <p>GitHub Practices Assessment for Startups</p>
        
        <nav className={`app-nav ${menuOpen ? 'open' : ''}`}>
          <button onClick={handleBack} className="nav-button">
            <i className="fas fa-arrow-left"></i> Back
          </button>
          
          {!isAuthenticated ? (
            <Link to="/auth" className="nav-button github-button">
              <i className="fab fa-github"></i> Connect GitHub
            </Link>
          ) : (
            <Link to="/dashboard" className="nav-button github-button">
              <i className="fab fa-github"></i> GitHub Dashboard
            </Link>
          )}
        </nav>
        <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </div>
      </header>
      
      <main className="app-content">
        <Routes>
          <Route path="/" element={<StageSelector onSelectStage={handleStageSelect} />} />
          
          <Route path="/assessment" element={
            selectedStage ? (
              <AssessmentFlow 
                stage={selectedStage} 
                onComplete={handleAssessmentComplete} 
                onBack={handleBack}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          
          <Route path="/results" element={
            selectedStage ? (
              <>
                <ResultsDashboard 
                  stage={selectedStage}
                  responses={responses}
                  onReset={handleReset}
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
        </Routes>
      </main>
      
      <footer className="app-footer">
        <p>OctoFlow - GitHub Practices Assessment Tool © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <Router basename={basePath}>
      <div className="App">
        <header className="App-header">
          <div className="logo-container">
            <img src={logo} alt="GitHub Logo" className="github-logo" />
            <h1>OctoFlow</h1>
            <div className="unofficial-badge">Unofficial</div>
          </div>
          <div className="disclaimer-banner">
            {APP_DISCLAIMER}
          </div>
          <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </div>
        </header>
        <GitHubProvider>
          <AppContent />
        </GitHubProvider>
      </div>
    </Router>
  );
}

export default App;
