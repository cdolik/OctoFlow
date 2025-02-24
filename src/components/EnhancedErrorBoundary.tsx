import React, { Component, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useError } from '../contexts/ErrorContext';
import { AssessmentError } from '../types/errors';
import { isAssessmentError } from '../utils/errorHandling';
import { useAudioFeedback } from './AudioFeedback';
import { trackError } from '../utils/analytics';
import { sanitizeError } from '../utils/sanitization';
import { ErrorContext } from '../types/errors';
import LoadingSpinner from './LoadingSpinner';
import './styles.css';

interface Props {
  children: React.ReactNode;
  onRecover?: () => void;
  fallback?: React.ReactNode;
  maxRetries?: number;
  component?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundaryBase extends Component<Props & { playSound: (type: string) => void }, State> {
  constructor(props: Props & { playSound: (type: string) => void }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.playSound('error');

    const context: ErrorContext = {
      component: this.props.component,
      metadata: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      }
    };

    // Track error with analytics
    trackError(error, context);

    this.setState({
      errorInfo
    });
  }

  handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.props.playSound('info');
      this.setState(
        prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }),
        () => {
          this.props.onRecover?.();
        }
      );
    } else {
      this.props.playSound('error');
    }
  };

  render(): React.ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (!hasError) return children;

    if (fallback) return fallback;

    const sanitizedError = error ? sanitizeError(error) : null;

    return (
      <div role="alert" className="error-boundary" aria-live="assertive">
        <div className="error-content">
          <h2>Something went wrong</h2>
          {sanitizedError && (
            <p className="error-message">{sanitizedError.message}</p>
          )}
          {retryCount < maxRetries ? (
            <button 
              onClick={this.handleRetry}
              className="retry-button"
              aria-label={`Retry (Attempt ${retryCount + 1} of ${maxRetries})`}
            >
              Try Again
            </button>
          ) : (
            <p className="max-retries">
              Maximum retry attempts reached. Please refresh the page.
            </p>
          )}
        </div>

        <style jsx>{`
          .error-boundary {
            padding: 2rem;
            margin: 1rem;
            border-radius: 8px;
            background: var(--error-background);
            color: var(--error-text);
          }

          .error-content {
            text-align: center;
          }

          .error-message {
            margin: 1rem 0;
            font-family: monospace;
            background: var(--error-message-background);
            padding: 1rem;
            border-radius: 4px;
            word-break: break-word;
          }

          .retry-button {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .retry-button:hover {
            background: var(--primary-color-dark);
          }

          .max-retries {
            color: var(--error-text-secondary);
            font-style: italic;
          }
        `}</style>
      </div>
    );
  }
}

// Wrapper component to provide audio feedback
export function EnhancedErrorBoundary(props: Props): JSX.Element {
  const { playSound } = useAudioFeedback();
  return <ErrorBoundaryBase {...props} playSound={playSound} />;
}

// Functional component for error display that can use hooks
const ErrorFallback: React.FC<{ error?: React.ReactNode }> = ({ error }) => {
  const navigate = useNavigate();
  const { error: contextError, isRecovering, handleError, clearError } = useError();

  const handleRetry = async () => {
    if (contextError) {
      const recovered = await handleError(contextError, async () => {
        clearError();
        return true;
      });

      if (recovered) {
        navigate(0); // Refresh current route
      }
    }
  };

  const handleReset = () => {
    clearError();
    navigate('/', { replace: true });
    sessionStorage.clear();
  };

  if (isRecovering) {
    return (
      <div className="error-recovery">
        <LoadingSpinner />
        <p>Attempting to recover...</p>
      </div>
    );
  }

  return (
    <div className="error-boundary" role="alert">
      <div className="error-content">
        <h2>Oops! Something went wrong</h2>
        {error || (
          <>
            <p className="error-message">
              {contextError?.message || 'An unexpected error occurred.'}
            </p>
            <div className="error-actions">
              {contextError?.recoverable && (
                <button 
                  onClick={handleRetry}
                  className="retry-button"
                >
                  Try to Recover
                </button>
              )}
              <button 
                onClick={handleReset}
                className="reset-button"
              >
                Start Over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};