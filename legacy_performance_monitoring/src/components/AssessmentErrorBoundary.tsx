import React, { Component, ErrorInfo } from 'react';
import { ErrorContext } from '../types/errors';
import { Stage } from '../types';

interface Props {
  stage: Stage;
  children: React.ReactNode;
  onRecovery?: () => void;
}

interface State {
  hasError: boolean;
}

class AssessmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context: ErrorContext = {
      component: 'AssessmentErrorBoundary',
      message: `Error in ${this.props.stage} stage: ${error.message}`,
      timestamp: new Date().toISOString()
    };
    // Log error to an error reporting service
  }

  handleRecovery = () => {
    this.setState({ hasError: false });
    if (this.props.onRecovery) this.props.onRecovery();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <button onClick={this.handleRecovery}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AssessmentErrorBoundary;
