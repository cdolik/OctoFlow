import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazyLoad } from '../utils/lazyLoad';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { Stage } from '../types';

// Lazy load route components
const Assessment = lazyLoad(
  () => import('./Assessment'),
  { 
    fallback: <LoadingSpinner message="Loading assessment..." />
  }
);

const Results = lazyLoad(
  () => import('./Results'),
  {
    fallback: <LoadingSpinner message="Loading results..." />
  }
);

const Summary = lazyLoad(
  () => import('./Summary'),
  {
    fallback: <LoadingSpinner message="Loading summary..." />
  }
);

const PreferencesPanel = lazyLoad(
  () => import('./PreferencesPanel'),
  {
    fallback: <LoadingSpinner message="Loading preferences..." />
  }
);

const AppRoutes: React.FC = () => (
  <ErrorBoundary>
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="/assessment/pre-seed" replace />} 
      />
      
      <Route 
        path="/assessment/:stage" 
        element={<Assessment />} 
      />
      
      <Route 
        path="/results" 
        element={<Results />} 
      />
      
      <Route 
        path="/summary" 
        element={<Summary />} 
      />
      
      <Route 
        path="/preferences" 
        element={<PreferencesPanel />} 
      />
      
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  </ErrorBoundary>
);

export default AppRoutes;
