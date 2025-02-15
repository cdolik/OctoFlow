import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Assessment from './components/Assessment';
import Summary from './components/Summary';
import Results from './components/Results';
import './App.css';
import './components/styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/results" element={<Results />} />
          <Route path="/" element={<Navigate to="/assessment" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
