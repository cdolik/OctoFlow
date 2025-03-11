import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Stage } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import Assessment from './components/Assessment';
import Results from './components/Results';
import PerformanceDashboard from './components/PerformanceDashboard';

// Simple Welcome component
const Welcome: React.FC = () => (
  <div className="welcome-container max-w-4xl mx-auto p-6 text-center">
    <div className="welcome-content bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Welcome to OctoFlow</h1>
      
      <p className="mb-6 text-lg">
        Optimize your GitHub workflow with personalized GitHub Actions recommendations.
        Take our quick assessment to discover the best actions for your project.
      </p>
      
      <div className="cta-button">
        <a 
          href="#/assessment" 
          className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 text-lg"
        >
          Start Assessment
        </a>
      </div>
    </div>
  </div>
);

// Simple Summary component
const Summary: React.FC = () => (
  <div className="summary-container max-w-4xl mx-auto p-6 text-center">
    <div className="summary-content bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Assessment Complete</h1>
      
      <p className="mb-6 text-lg">
        Thank you for completing the OctoFlow assessment. We hope the recommendations
        help you optimize your GitHub workflow with the right actions.
      </p>
      
      <div className="cta-buttons flex justify-center space-x-4">
        <a 
          href="#/" 
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </a>
        <a 
          href="#/results" 
          className="inline-block bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
        >
          View Results Again
        </a>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <div className="app-container min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/assessment" element={<Assessment stage={Stage.Assessment} />} />
            <Route path="/results" element={<Results />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/performance" element={<PerformanceDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
