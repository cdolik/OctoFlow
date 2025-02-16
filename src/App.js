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
        1>
  <header className="hero-section">
    <div className="hero-content">
        <h1>OctoFlow</h1>
        <h2>Benchmark Your Engineering Health</h2>
        <p>2x deployment speed, enterprise security at startup cost</p>
        <div className="value-stack">
            <div className="value-stack-item">
                <h3>2x Deployment Speed</h3>
                <p>Accelerate your delivery with streamlined workflows.</p>
            </div>
            <div className="value-stack-item">
                <h3>Enterprise Security</h3>
                <p>Ensure top-notch security without breaking the bank.</p>
            </div>
            <div className="value-stack-item">
                <h3>Startup Cost</h3>
                <p>Optimize costs while maintaining high standards.</p>
            </div>
        </div>
    </div>
</header>  <p>2x deployment speed, enterprise security at startup cost</p>

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
