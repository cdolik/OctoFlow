import React from 'react';
import { clearAssessment, getAssessmentState } from '../utils/storage';
import { trackCTAClick, trackError } from '../utils/analytics';

class AssessmentErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
    canRecover: true
  };

  static getDerivedStateFromError(error: Error) {
    // Check if error is related to data corruption
    const isDataError = error.message.includes('storage') || 
                       error.message.includes('assessment state');
    
    return { 
      hasError: true, 
      error,
      canRecover: !isDataError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const assessmentState = getAssessmentState();
    
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

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    trackCTAClick('assessment_retry');
  };

  handleReset = () => {
    clearAssessment();
    trackCTAClick('assessment_reset');
    window.location.href = '/stage-select';
  };

  render() {
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