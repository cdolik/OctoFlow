import React from 'react';
import { ErrorReporter } from '../utils/errorReporting';
import { trackError } from '../utils/analytics';
import type { AssessmentError, ErrorContext } from '../types/errors';
import type { ErrorBoundaryProps } from '../types/props';
import { Stage } from '../types';

interface Props extends ErrorBoundaryProps {
  stage?: Stage;
}

interface State {
  error: Error | null;
  isRecovering: boolean;
}

export class AssessmentErrorBoundary extends React.Component<Props, State> {
  private errorReporter: ErrorReporter;

  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      isRecovering: false
    };
    this.errorReporter = ErrorReporter.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const context: ErrorContext = {
      component: 'AssessmentErrorBoundary',
      action: 'catch_error',
      message: error.message,
      timestamp: new Date().toISOString()
    };

    this.errorReporter.reportError(error, errorInfo.componentStack, this.props.stage);
    trackError(error, context);
  }

  handleRecovery = async (): Promise<void> => {
    this.setState({ isRecovering: true });
    
    try {
      await this.props.onRecover?.();
      this.setState({ error: null, isRecovering: false });
    } catch (error) {
      this.setState({ isRecovering: false });
      if (error instanceof Error) {
        trackError(error, {
          component: 'AssessmentErrorBoundary',
          action: 'recovery_failed',
          message: 'Recovery attempt failed',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return this.props.fallback || (
        <div role="alert">
          <h2>Something went wrong with the assessment</h2>
          <p>We encountered an issue while processing your assessment.</p>
          {!this.state.isRecovering && (
            <button 
              onClick={this.handleRecovery}
              disabled={this.state.isRecovering}
            >
              Try to recover
            </button>
          )}
          {this.state.isRecovering && <p>Attempting to recover...</p>}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AssessmentErrorBoundary;
