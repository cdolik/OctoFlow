import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Assessment from './components/Assessment';
import Results from './components/Results';

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/assessment" />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
