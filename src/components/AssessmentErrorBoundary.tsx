import React, { Component, ReactNode, ErrorInfo } from 'react';
import { clearAssessmentData, getAssessmentResponses } from '../utils/storage';
import { trackCTAClick, trackError } from '../utils/analytics';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  canRecover: boolean;
}

interface AssessmentState {
  currentStage?: string;
  responses?: Record<string, number>;
}

export class AssessmentErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    canRecover: true
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if error is related to data corruption
    const isDataError = error.message.includes('storage') || 
                       error.message.includes('assessment state');
    
    return { 
      hasError: true, 
      error,
      canRecover: !isDataError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const assessmentState = getAssessmentResponses() as AssessmentState | null;
    
    this.setState({
      error,
      errorInfo
    });

    // Track error with context
    trackError('assessment_error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      assessmentStage: assessmentState?.currentStage,
      hasResponses: !!assessmentState?.responses
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    trackCTAClick('assessment_retry');
  };

  handleReset = (): void => {
    clearAssessmentData();
    trackCTAClick('assessment_reset');
    window.location.href = '/stage-select';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-state assessment-error">
          <h2>Assessment Error</h2>
          <p>We encountered an issue during your assessment.</p>
          
          <div className="error-actions">
            {this.state.canRecover && (
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                Try Again
              </button>
            )}
            
            <button 
              onClick={this.handleReset}
              className="cta-button"
            >
              Restart Assessment
            </button>
            
            {!this.state.canRecover && (
              <small className="error-notice">
                Due to a data issue, you'll need to restart the assessment
              </small>
            )}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AssessmentErrorBoundary;