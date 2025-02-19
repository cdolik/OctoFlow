import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearAssessmentData } from '../utils/storage';
import { Stage } from './withFlowValidation';

interface Props {
  children: ReactNode;
  currentStage?: Stage;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AssessmentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Clear only assessment data to preserve other app state
    clearAssessmentData();

    // Log error with context
    console.error('Assessment Error:', {
      error,
      errorInfo,
      stage: this.props.currentStage
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="assessment-error">
          <h2>Assessment Error</h2>
          <p>We encountered an error while processing your assessment.</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
          )}
          <div className="error-actions">
            <button 
              onClick={this.handleRetry}
              className="retry-button"
              type="button"
            >
              Retry Assessment
            </button>
            <a 
              href="/"
              className="home-link"
            >
              Return to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AssessmentErrorBoundary;