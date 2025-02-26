import React from 'react';
import { ErrorFallback } from './ErrorFallback';
import type { ErrorBoundaryProps } from '../types/props';
import { trackError } from '../utils/analytics';
import type { ErrorContext } from '../types/errors';

interface State {
  error: Error | null;
  componentStack?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  state: State = {
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const context: ErrorContext = {
      component: 'ErrorBoundary',
      action: 'catch_error',
      message: error.message,
      timestamp: new Date().toISOString()
    };

    trackError(error, context);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ error: null });
    this.props.onRecover?.();
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return this.props.fallback || (
        <ErrorFallback 
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
