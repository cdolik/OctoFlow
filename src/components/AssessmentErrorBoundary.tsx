import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '../utils/analytics';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  onRecovery?: () => void;
}

interface State {
  error: Error | null;
  errorCount: number;
}

export class AssessmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      errorCount: 1
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    trackError(error, {
      component: 'AssessmentErrorBoundary',
      errorCount: this.state.errorCount + 1,
      ...errorInfo
    });
  }

  private handleReset = (): void => {
    // If we've had multiple errors, trigger full recovery
    if (this.state.errorCount > 2) {
      this.props.onRecovery?.();
    } else {
      this.setState(prev => ({
        error: null,
        errorCount: prev.errorCount + 1
      }));
    }
  };

  private handleRecover = async (): Promise<void> => {
    try {
      // Attempt recovery through parent handler
      await this.props.onRecovery?.();
      this.setState({ error: null });
    } catch (recoveryError) {
      this.setState(prev => ({
        error: recoveryError instanceof Error ? recoveryError : new Error('Recovery failed'),
        errorCount: prev.errorCount + 1
      }));
    }
  };

  render(): ReactNode {
    const { error } = this.state;

    if (error) {
      return (
        <ErrorFallback
          error={error}
          resetError={this.handleReset}
          recoverError={this.handleRecover}
          showRecoveryOption={this.state.errorCount <= 2}
        />
      );
    }

    return this.props.children;
  }
}
