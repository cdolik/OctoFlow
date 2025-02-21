import React, { Component, ReactNode, ErrorInfo } from 'react';
import { getAssessmentResponses } from '../utils/storage';
import { clearAssessmentData } from '../utils/storage';
import { trackCTAClick, trackError } from '../utils/analytics';
import { ErrorReporter } from '../utils/errorReporting';
import { Stage } from './withFlowValidation';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  canRecover: boolean;
  isRecovering: boolean;
}

interface AssessmentState {
  currentStage?: Stage;
  responses?: Record<string, number>;
}

export class AssessmentErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    canRecover: true,
    isRecovering: false
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
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

    ErrorReporter.report(error, errorInfo.componentStack || undefined);

    trackError('assessment_error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      assessmentStage: assessmentState?.currentStage,
      hasResponses: !!assessmentState?.responses
    });
  }

  handleRetry = async (): Promise<void> => {
    this.setState({ isRecovering: true });

    try {
      const currentStage = (getAssessmentResponses() as AssessmentState)?.currentStage || 'pre-seed';
      const recovered = await ErrorReporter.attemptRecovery({
        errorType: this.state.error?.name || 'Unknown',
        message: this.state.error?.message || 'Unknown error',
        timestamp: Date.now(),
        stage: currentStage
      });

      if (recovered) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRecovering: false
        });
        trackCTAClick('assessment_recovery_success');
      } else {
        this.setState({
          isRecovering: false,
          canRecover: false
        });
        trackCTAClick('assessment_recovery_failed');
      }
    } catch (error) {
      this.setState({
        isRecovering: false,
        canRecover: false
      });
      trackCTAClick('assessment_recovery_error');
    }
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
            {this.state.isRecovering ? (
              <div className="recovery-status">
                <LoadingSpinner size="small" message="Attempting to recover..." />
              </div>
            ) : (
              <>
                {this.state.canRecover && (
                  <button 
                    onClick={this.handleRetry}
                    className="retry-button"
                  >
                    Try to Recover
                  </button>
                )}
                
                <button 
                  onClick={this.handleReset}
                  className="cta-button"
                >
                  {this.state.canRecover ? 'Restart Assessment' : 'Reload Page'}
                </button>
                
                {!this.state.canRecover && (
                  <small className="error-notice">
                    Due to a data issue, you'll need to restart the assessment
                  </small>
                )}
              </>
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