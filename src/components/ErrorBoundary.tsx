import React, { Component, ErrorInfo, ReactNode } from 'react';
import { validateStorageState } from '../utils/storageValidation';
import { trackError } from '../utils/analytics';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  onRecovery?: () => Promise<void>;
  onReset?: () => void;
  fallbackComponent?: React.ComponentType<{ 
    error: Error; 
    resetError: () => void;
    recoverError?: () => Promise<void>;
  }>;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
  recoveryAttempts: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempts: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    trackError(error, {
      component: 'ErrorBoundary',
      info: errorInfo,
      recoveryAttempts: this.state.recoveryAttempts
    });
  }

  private isStorageError = (error: Error): boolean => {
    return error.message.includes('storage') || 
           error.message.includes('localStorage') || 
           error.message.includes('sessionStorage');
  };

  private handleRecovery = async (): Promise<void> => {
    this.setState({ isRecovering: true });

    try {
      // Attempt to validate current storage state
      const currentState = sessionStorage.getItem('octoflow');
      if (currentState) {
        const parsedState = JSON.parse(currentState);
        const validation = validateStorageState(parsedState);

        if (!validation.isValid) {
          throw new Error(`Invalid storage state: ${validation.errors.join(', ')}`);
        }
      }

      // If validation passes or no state exists, try recovery
      await this.props.onRecovery?.();
      
      this.setState({
        error: null,
        errorInfo: null,
        isRecovering: false,
        recoveryAttempts: 0
      });
    } catch (recoveryError) {
      this.setState(prevState => ({
        error: recoveryError instanceof Error ? recoveryError : new Error('Recovery failed'),
        isRecovering: false,
        recoveryAttempts: prevState.recoveryAttempts + 1
      }));

      trackError(recoveryError instanceof Error ? recoveryError : new Error('Recovery failed'), {
        context: 'error_recovery',
        attempts: this.state.recoveryAttempts + 1
      });
    }
  };

  private handleReset = (): void => {
    this.props.onReset?.();
    this.setState({
      error: null,
      errorInfo: null,
      isRecovering: false,
      recoveryAttempts: 0
    });
  };

  render(): ReactNode {
    const { error, isRecovering, recoveryAttempts } = this.state;
    const { children, fallbackComponent: FallbackComponent = ErrorFallback } = this.props;

    if (error) {
      const canAttemptRecovery = this.isStorageError(error) && recoveryAttempts < 3;

      return (
        <FallbackComponent
          error={error}
          resetError={this.handleReset}
          recoverError={canAttemptRecovery ? this.handleRecovery : undefined}
          isRecovering={isRecovering}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;