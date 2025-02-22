import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { getAssessmentResponses, getAssessmentMetadata } from '../utils/storage';
import { clearAssessmentData } from '../utils/storage';
import { trackCTAClick, trackError } from '../utils/analytics';
import { ErrorReporter } from '../utils/errorReporting';
import { Stage } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  onRecovery: () => void;
}

interface ErrorState {
  error: Error;
  componentStack: string;
}

interface AssessmentState {
  currentStage?: Stage;
  responses?: Record<string, number>;
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [canRecover, setCanRecover] = useState(true);

  const handleRetry = useCallback(async () => {
    setIsRecovering(true);

    try {
      const currentStage = (getAssessmentResponses() as AssessmentState)?.currentStage || 'pre-seed';
      const recovered = await ErrorReporter.attemptRecovery({
        errorType: error.name,
        message: error.message,
        timestamp: Date.now(),
        stage: currentStage
      });

      if (recovered) {
        trackCTAClick('assessment_recovery_success');
        resetErrorBoundary();
      } else {
        setCanRecover(false);
        trackCTAClick('assessment_recovery_failed');
      }
    } catch {
      setCanRecover(false);
      trackCTAClick('assessment_recovery_error');
    } finally {
      setIsRecovering(false);
    }
  }, [error, resetErrorBoundary]);

  const handleReset = useCallback(() => {
    clearAssessmentData();
    trackCTAClick('assessment_reset');
    window.location.href = '/stage-select';
  }, []);

  const isDataError = error.message.includes('storage') || 
                     error.message.includes('assessment state');

  if (isRecovering) {
    return (
      <div className="recovery-status">
        <LoadingSpinner size="small" message="Attempting to recover..." />
      </div>
    );
  }

  return (
    <div className="error-state assessment-error">
      <h2>Assessment Error</h2>
      <p>We encountered an issue during your assessment.</p>
      
      <div className="error-actions">
        {canRecover && !isDataError && (
          <button 
            onClick={handleRetry}
            className="retry-button"
          >
            Try to Recover
          </button>
        )}
        
        <button 
          onClick={handleReset}
          className="cta-button"
        >
          {canRecover ? 'Restart Assessment' : 'Reload Page'}
        </button>
        
        {!canRecover && (
          <small className="error-notice">
            Due to a data issue, you'll need to restart the assessment
          </small>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>Error Details</summary>
          <pre>{error.toString()}</pre>
        </details>
      )}
    </div>
  );
};

const AssessmentErrorBoundary: React.FC<Props> = ({ children, onRecovery }) => {
  const handleError = useCallback((error: Error, info: ErrorState) => {
    const assessmentState = getAssessmentResponses() as AssessmentState | null;
    
    ErrorReporter.report(error, info.componentStack);

    trackError('assessment_error', {
      error: error.message,
      componentStack: info.componentStack,
      assessmentStage: assessmentState?.currentStage,
      hasResponses: !!assessmentState?.responses,
      metadata: getAssessmentMetadata()
    });
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onRecovery}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AssessmentErrorBoundary;