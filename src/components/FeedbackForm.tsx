import React from 'react';

const FeedbackForm: React.FC = () => {
  return (
    <div className="feedback-form">
      <h3>Help Us Improve OctoFlow</h3>
      <p>Your feedback helps us make OctoFlow better for everyone.</p>
      <div className="feedback-buttons">
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSfXuZD7OR2_X8BQiUHB5UHHFqxY9sQl9Z9H9J9Z9H9J9Z9H9J/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="feedback-button"
        >
          <span role="img" aria-label="pencil">📝</span> Share Your Feedback
        </a>
        <a 
          href="https://github.com/cdolik/OctoFlow/issues/new?template=bug_report.md"
          target="_blank"
          rel="noopener noreferrer"
          className="feedback-button"
        >
          <span role="img" aria-label="bug">🐞</span> Report a Bug
        </a>
        <a 
          href="https://github.com/cdolik/OctoFlow/issues/new?template=feature_request.md"
          target="_blank"
          rel="noopener noreferrer"
          className="feedback-button"
        >
          <span role="img" aria-label="light bulb">💡</span> Request a Feature
        </a>
      </div>
    </div>
  );
};

export default FeedbackForm; 