import React from 'react';
import { trackCTAClick } from '../utils/analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Flow Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    sessionStorage.clear();
    trackCTAClick('error_reset');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <div className="error-actions">
            <button 
              onClick={this.handleReset}
              className="cta-button"
            >
              Start Over
            </button>
            <small>This will clear your progress</small>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="error-details">
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}