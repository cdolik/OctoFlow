import React from 'react';
import { ErrorBoundary, ErrorBoundaryProps } from 'react-error-boundary';
import { Stage } from '../types';
import { ErrorReporter } from '../utils/errorReporting';
import { trackError } from '../utils/analytics';
import { ErrorContext } from '../types/errors';

interface Props extends ErrorBoundaryProps {
  stage?: Stage;
  onRecover?: () => void;
}

interface State {
  error: Error | null;
  isRecovering: boolean;
}

export class AssessmentErrorBoundary extends React.Component<Props, State> {
  private errorReporter: typeof ErrorReporter;

  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      isRecovering: false
    };
    this.errorReporter = ErrorReporter.getInstance();
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const context: ErrorContext = {
      component: 'AssessmentErrorBoundary',
      action: 'catch_error',
      stage: this.props.stage,
      timestamp: new Date().toISOString()
    };

    this.errorReporter.reportError(error, errorInfo.componentStack || '', this.props.stage);
    trackError(error, context);
  }

  handleRecovery = async () => {
    this.setState({ isRecovering: true });

    try {
      const recovered = await this.errorReporter.attemptRecovery();
      if (recovered) {
        this.setState({ error: null, isRecovering: false });
        this.props.onRecover?.();
      } else {
        const context: ErrorContext = {
          component: 'AssessmentErrorBoundary',
          action: 'recovery_failed',
          stage: this.props.stage,
          timestamp: new Date().toISOString()
        };
        trackError(new Error('Recovery attempt failed'), context);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Recovery failed');
      trackError(error, {
        component: 'AssessmentErrorBoundary',
        action: 'recovery_error',
        stage: this.props.stage,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.setState({ isRecovering: false });
    }
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return this.props.fallback || (
        <div role="alert" className="assessment-error">
          <h2>Assessment Error</h2>
          <p>We encountered an issue while processing your assessment.</p>
          {!this.state.isRecovering && (
            <button 
              onClick={this.handleRecovery}
              disabled={this.state.isRecovering}
              className="recovery-button"
            >
              Try to Recover
            </button>
          )}
          {this.state.isRecovering && (
            <div className="recovery-status">
              <p>Attempting to recover...</p>
              <div className="spinner" role="progressbar" />
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AssessmentErrorBoundary;
