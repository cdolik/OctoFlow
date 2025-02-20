import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReporter } from '../utils/errorReporting';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: ReactNode;
  currentStage?: Stage;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  isRecovering: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AssessmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isRecovering: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    ErrorReporter.report(error, errorInfo.componentStack);
  }

  handleRetry = async () => {
    this.setState({ isRecovering: true });
    
    if (this.state.error) {
      const errorReport = {
        timestamp: Date.now(),
        stage: sessionStorage.getItem('currentStage') || 'assessment',
        errorType: this.state.error.name,
        message: this.state.error.message,
        componentStack: this.state.errorInfo?.componentStack
      };

      const recovered = await ErrorReporter.attemptRecovery(errorReport);
      
      if (recovered) {
        this.setState({
          hasError: false,
          isRecovering: false,
          error: null,
          errorInfo: null
        });
        return;
      }
    }

    // If recovery failed or wasn't possible, refresh the page
    window.location.reload();
  };

  render() {
    if (this.state.isRecovering) {
      return (
        <div className="error-recovery">
          <LoadingSpinner 
            message="Attempting to recover..." 
            size="large"
            showProgress={true}
            progress={50}
          />
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h2>Something went wrong</h2>
          <p>We've logged this error and are working to fix it.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="error-details">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
          <div className="error-actions">
            <button onClick={this.handleRetry} className="retry-button">
              Try to Recover
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AssessmentErrorBoundary;