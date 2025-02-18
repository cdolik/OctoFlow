import React from 'react';
import { Navigate } from 'react-router-dom';

class GlobalErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
    redirectHome: false
  };

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details
    console.error('Global error caught:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Clear any corrupted state from storage
    if (error.message.includes('storage') || error.message.includes('persisted state')) {
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  handleRetry = () => {
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Force reload app state
    window.location.reload();
  };

  handleRedirectHome = () => {
    this.setState({ redirectHome: true });
  };

  render() {
    if (this.state.redirectHome) {
      return <Navigate to="/" replace />;
    }

    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h1>Something went wrong</h1>
          <p>We apologize for the inconvenience. Please try one of the following:</p>
          <div className="error-actions">
            <button onClick={this.handleRetry} className="retry-button">
              Retry Current Page
            </button>
            <button onClick={this.handleRedirectHome} className="home-button">
              Return to Home
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>Error Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}