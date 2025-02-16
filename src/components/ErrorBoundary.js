import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error) {
    console.error('Assessment error:', error);
    sessionStorage.clear();
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>We've cleared your session data. Please try starting over.</p>
          <button 
            className="cta-button"
            onClick={() => window.location.href = '/'}
          >
            Restart Assessment
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}