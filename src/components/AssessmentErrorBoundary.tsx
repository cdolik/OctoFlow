import React, { Component, ErrorInfo } from 'react';
import { errorReporter } from '../utils/errorReporting';
import { ErrorContext, AssessmentError } from '../types/errors';

interface Props {
  children: React.ReactNode;
  onRecover?: () => void;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AssessmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const context: ErrorContext = {
      component: 'AssessmentErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack
      }
    };

    errorReporter.report(error, context);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRecover?.();
  };

  private isRecoverable(): boolean {
    const { error } = this.state;
    if (!error) return true;

    return !(error as AssessmentError)?.recoverable === false;
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    if (fallback) return fallback;

    return (
      <div role="alert" className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error?.message}</p>
        {this.isRecoverable() && (
          <button onClick={this.handleRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    );
  }
}

export default AssessmentErrorBoundary;
