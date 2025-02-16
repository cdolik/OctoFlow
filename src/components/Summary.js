import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssessmentData } from '../utils/storage';
import './styles.css';

const Summary = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    const data = getAssessmentData();
    if (Object.keys(data).length === 0) {
      navigate('/');
      return;
    }
    setAssessmentData(data);
  }, [navigate]);

  if (!assessmentData) return null;

  return (
    <div className="summary-container">
      <h1>Assessment Summary</h1>
      <div className="summary-content">
        <div className="summary-section">
          <h2>Your Responses</h2>
          {Object.entries(assessmentData).map(([key, value]) => (
            <div key={key} className="response-item">
              <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
            </div>
          ))}
        </div>
        
        <div className="summary-actions">
          <button 
            className="cta-button"
            onClick={() => navigate('/results')}
          >
            View Detailed Results
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/assessment')}
          >
            Revise Answers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;