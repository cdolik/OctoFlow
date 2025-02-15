import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Assessment from './components/Assessment';
import Summary from './components/Summary';
import Results from './components/Results';
import StageSelector from './components/StageSelector';
import './App.css';
import './components/styles.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize session storage if needed
    if (!sessionStorage.getItem('assessmentAnswers')) {
      sessionStorage.setItem('assessmentAnswers', '{}');
      sessionStorage.setItem('currentCategory', '0');
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>OctoFlow</h1>
          <p>GitHub Workflow Assessment Tool</p>
        </header>
        <Routes>
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/results" element={<Results />} />
          <Route path="/" element={<StageSelector />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
