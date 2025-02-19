import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearAllStorage } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
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

    // Clear storage on critical errors to prevent persistent error states
    if (this.isCriticalError(error)) {
      clearAllStorage();
    }

    // Log error to monitoring service
    console.error('Error caught by GlobalErrorBoundary:', error, errorInfo);
  }

  private isCriticalError(error: Error): boolean {
    const criticalErrors = [
      'QuotaExceededError',
      'SecurityError',
      'InvalidStateError',
      'SyntaxError'
    ];
    
    return criticalErrors.some(errorType => 
      error.name === errorType || error.message.includes(errorType)
    );
  }

  private handleReset = (): void => {
    clearAllStorage();
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>We apologize for the inconvenience. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
          )}
          <button 
            onClick={this.handleReset}
            className="reset-button"
            type="button"
          >
            Reset Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;