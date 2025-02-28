import React, { Component, ErrorInfo } from 'react';
import { ErrorContext } from '../types/errors';
import { errorReporter } from '../utils/errorReporting';

interface Props {
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error }>;
  onReset?: () => void;
  onError?: (error: Error) => void;
  context?: ErrorContext;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { context, onError } = this.props;
    
    // Report error with context
    errorReporter.reportError(error, errorInfo.componentStack, context?.stage, {
      component: context?.component || 'unknown',
      isCritical: context?.isCritical || false,
    });

    // Notify parent if handler provided
    onError?.(error);
  }

  handleReset = (): void => {
    this.setState({
      error: null,
      hasError: false
    });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    const { fallback: Fallback, children } = this.props;
    const { error, hasError } = this.state;

    if (hasError && error) {
      return <Fallback error={error} />;
    }

    return children;
  }
}

export default ErrorBoundary;
