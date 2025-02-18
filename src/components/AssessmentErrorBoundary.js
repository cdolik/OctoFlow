import React from 'react';
import { clearAssessment } from '../utils/storage';
import { trackCTAClick } from '../utils/analytics';

class AssessmentErrorBoundary extends React.Component {
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
    console.error('Assessment Flow Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    trackCTAClick('assessment_error');
  }

  handleReset = () => {
    clearAssessment();
    trackCTAClick('assessment_reset');
    window.location.href = '/stage-select';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state assessment-error">
          <h2>Assessment Error</h2>
          <p>We encountered an issue during your assessment.</p>
          <div className="error-actions">
            <button 
              onClick={this.handleReset}
              className="cta-button"
            >
              Restart Assessment
            </button>
            <small>Your progress will be cleared</small>
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

export default AssessmentErrorBoundary;