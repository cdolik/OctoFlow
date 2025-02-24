import React, { Component, ErrorInfo } from 'react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

function isNetworkError(error: Error): boolean {
  return (
    error.name === 'NetworkError' ||
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed')
  );
}

// Wrapper component to access hooks and provide to error boundary
function NetworkErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  const { isOffline } = useOfflineStatus();
  const { playSound } = useAudioFeedback();

  return (
    <NetworkErrorBoundaryInner 
      isOffline={isOffline} 
      playSound={playSound}
    >
      {children}
    </NetworkErrorBoundaryInner>
  );
}

class NetworkErrorBoundaryInner extends Component<
  Props & { isOffline: boolean; playSound: (sound: string) => void },
  State
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props & { isOffline: boolean; playSound: (sound: string) => void }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isNetworkError(error)) {
      this.props.playSound('error');
      this.props.onError?.(error, errorInfo);
      this.scheduleRetry();
    }
  }

  componentDidUpdate(prevProps: Props & { isOffline: boolean }) {
    // Attempt retry when coming back online
    if (prevProps.isOffline && !this.props.isOffline) {
      this.handleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private scheduleRetry() {
    const backoffTime = Math.min(
      1000 * Math.pow(2, this.state.retryCount),
      30000
    );

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, backoffTime);
  }

  private handleRetry = () => {
    if (this.props.isOffline) {
      return; // Don't retry while offline
    }

    this.setState(
      prevState => ({
        hasError: false,
        retryCount: prevState.retryCount + 1
      }),
      () => {
        this.props.playSound('navigation');
      }
    );
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (!isNetworkError(this.state.error!)) {
      throw this.state.error; // Let parent error boundary handle non-network errors
    }

    const retryInProgress = this.state.retryCount > 0;
    const maxRetriesReached = this.state.retryCount >= 5;

    return (
      <div role="alert" className="network-error">
        <div className="error-content">
          <h2>Network Error</h2>
          {this.props.isOffline ? (
            <p>You're currently offline. Changes will sync when connection is restored.</p>
          ) : (
            <p>There was a problem connecting to the server.</p>
          )}
          
          {!this.props.isOffline && !maxRetriesReached && (
            <button 
              onClick={this.handleRetry}
              disabled={retryInProgress}
              className="retry-button"
            >
              {retryInProgress ? 'Retrying...' : 'Retry Now'}
            </button>
          )}

          {maxRetriesReached && !this.props.isOffline && (
            <p className="max-retries">
              Maximum retry attempts reached. Please refresh the page to try again.
            </p>
          )}

          <LiveRegion>
            {this.props.isOffline
              ? 'Working offline. Changes will sync when connection is restored.'
              : `Network error. ${
                  maxRetriesReached 
                    ? 'Maximum retry attempts reached.' 
                    : retryInProgress 
                      ? 'Attempting to reconnect...' 
                      : 'Click Retry Now to try again.'
                }`
            }
          </LiveRegion>
        </div>

        <style jsx>{`
          .network-error {
            padding: 2rem;
            margin: 1rem;
            background: var(--error-background);
            border-radius: 8px;
            color: var(--error-text);
          }

          .error-content {
            text-align: center;
          }

          h2 {
            margin: 0 0 1rem;
            font-size: 1.5rem;
          }

          p {
            margin: 1rem 0;
            line-height: 1.5;
          }

          .retry-button {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.2s;
          }

          .retry-button:hover:not(:disabled) {
            background: var(--primary-color-dark);
          }

          .retry-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .max-retries {
            color: var(--warning-text);
            font-style: italic;
          }

          @media (max-width: 768px) {
            .network-error {
              margin: 0.5rem;
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export const NetworkErrorBoundary = NetworkErrorBoundaryWrapper;