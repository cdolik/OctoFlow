import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazyLoad } from '../utils/lazyLoad';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { Stage } from '../types';
import { AssessmentProps, SummaryProps, ResultsProps, PreferencesPanelProps } from '../types/props';

interface AppRoutesProps {
  currentStage: Stage | null;
  onAssessmentComplete: () => void;
  onAssessmentError: () => void;
}

const Assessment = lazyLoad<AssessmentProps>({
  importFunc: () => import('./Assessment'),
  fallback: <LoadingSpinner message="Loading assessment..." />
});

const Results = lazyLoad<ResultsProps>({
  importFunc: () => import('./Results'),
  fallback: <LoadingSpinner message="Loading results..." />
});

const Summary = lazyLoad<SummaryProps>({
  importFunc: () => import('./Summary'),
  fallback: <LoadingSpinner message="Loading summary..." />
});

const PreferencesPanel = lazyLoad<PreferencesPanelProps>({
  importFunc: () => import('./PreferencesPanel'),
  fallback: <LoadingSpinner message="Loading preferences..." />
});

const preferences: PreferencesPanelProps['preferences'] = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  motionReduced: false,
  keyboardMode: 'basic',
  autoSave: true,
  autoSaveInterval: 10,
  soundEnabled: true
};

const AppRoutes: React.FC<AppRoutesProps> = ({
  currentStage,
  onAssessmentComplete,
  onAssessmentError
}) => (
  <ErrorBoundary fallback={ErrorFallback}>
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="/assessment/pre-seed" replace />} 
      />
      
      <Route 
        path="/assessment/:stage" 
        element={
          <Assessment 
            stage={currentStage as Stage} 
            onComplete={onAssessmentComplete}
            onError={onAssessmentError}
          />
        } 
      />
      
      <Route 
        path="/results" 
        element={
          <Results 
            stage={currentStage as Stage}
            onComplete={onAssessmentComplete}
          />
        } 
      />
      
      <Route 
        path="/summary" 
        element={
          <Summary 
            stage={currentStage as Stage}
            onComplete={onAssessmentComplete}
          />
        } 
      />
      
      <Route 
        path="/preferences" 
        element={<PreferencesPanel preferences={preferences} onPreferencesChange={() => {}} />} 
      />
      
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  </ErrorBoundary>
);

export default AppRoutes;
