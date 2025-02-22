import React, { Component, ErrorInfo } from 'react';
import { trackErrorWithRecovery, trackError } from '../utils/analytics';
import { backupState, restoreFromBackup } from '../utils/storage';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isRecovering: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Always backup state when an error occurs
    backupState();
    
    trackErrorWithRecovery(error, false, false);
    trackError(error, {
      component: 'GlobalErrorBoundary',
      stack: errorInfo.componentStack,
      url: window.location.href
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = async () => {
    this.setState({ isRecovering: true });

    try {
      const recovered = await restoreFromBackup();
      trackErrorWithRecovery(this.state.error!, true, recovered);

      if (recovered) {
        this.setState({ hasError: false, error: null });
      }
    } catch (e) {
      trackErrorWithRecovery(this.state.error!, true, false);
      console.error('Recovery failed:', e);
    } finally {
      this.setState({ isRecovering: false });
    }
  };

  handleReset = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isStorageError = this.state.error?.message.includes('storage');
      const isNetworkError = this.state.error?.message.includes('network');

      return (
        <div className="error-boundary" role="alert">
          <h2>Oops! Something went wrong</h2>
          
          {this.state.isRecovering ? (
            <div className="recovery-status">
              <LoadingSpinner size="small" />
              <p>Attempting to recover your progress...</p>
            </div>
          ) : (
            <>
              <p>
                {isStorageError ? 
                  "We encountered an issue saving your progress. Please ensure you have enough storage space and cookies enabled." :
                  isNetworkError ?
                    "We're having trouble connecting. Please check your internet connection." :
                    "We encountered an unexpected issue."}
              </p>

              <div className="error-actions">
                {!isStorageError && (
                  <button 
                    onClick={this.handleRetry}
                    className="retry-button"
                  >
                    Try to Recover
                  </button>
                )}
                <button 
                  onClick={this.handleReset}
                  className="reset-button"
                >
                  Start Over
                </button>
              </div>
            </>
          )}

          {process.env.NODE_ENV === 'development' && (
            <pre className="error-details">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;