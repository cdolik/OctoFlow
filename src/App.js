import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Assessment from './components/Assessment';
import Summary from './components/Summary';
import Results from './components/Results';
import StageSelector from './components/StageSelector';
import Hero from './components/Hero';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './components/styles.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize session storage if needed
    if (!sessionStorage.getItem('octoflow')) {
      sessionStorage.setItem('octoflow', '{}');
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <StageSelector />
              </>
            } />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
