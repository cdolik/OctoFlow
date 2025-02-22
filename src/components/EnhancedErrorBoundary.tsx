import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useError } from '../contexts/ErrorContext';
import { AssessmentError } from '../types/errors';
import { isAssessmentError } from '../utils/errorHandling';
import LoadingSpinner from './LoadingSpinner';
import './styles.css';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class EnhancedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isAssessmentError(error)) {
      this.handleAssessmentError(error);
    } else {
      // Convert to AssessmentError if not already
      const assessmentError: AssessmentError = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: 'high',
        recoverable: false,
        context: {
          componentStack: errorInfo.componentStack
        }
      };
      this.handleAssessmentError(assessmentError);
    }
  }

  private handleAssessmentError(error: AssessmentError) {
    // We need to handle this in a child component that has access to hooks
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.props.fallback} />;
    }

    return this.props.children;
  }
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