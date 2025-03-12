import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StartupStage, Category } from '../data/questions';
import { getAssessmentHistory, deleteAssessmentById } from '../utils/historyUtils';
import Settings from './Settings';

interface HistoryDashboardProps {
  onClose: () => void;
}

const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ onClose }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);
  
  // Load history from localStorage
  const loadHistory = () => {
    const assessmentHistory = getAssessmentHistory();
    setHistory(assessmentHistory);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get color for score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#2196F3'; // Blue
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  // Delete history item
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      deleteAssessmentById(id);
      loadHistory();
      if (selectedItem === id) {
        setSelectedItem(null);
      }
    }
  };
  
  // Clear all history
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all assessment history? This cannot be undone.')) {
      localStorage.removeItem('octoflow_assessment_history');
      setHistory([]);
      setSelectedItem(null);
    }
  };
  
  // Open settings
  const handleOpenSettings = () => {
    setShowSettings(true);
  };
  
  // Close settings and refresh history
  const handleCloseSettings = () => {
    setShowSettings(false);
    loadHistory(); // Reload history in case settings changed
  };
  
  return (
    <div className="history-dashboard-overlay">
      <div className="history-dashboard">
        <div className="history-header">
          <h2>Assessment History</h2>
          <div className="history-actions">
            <button 
              className="settings-button"
              onClick={handleOpenSettings}
              aria-label="Settings"
            >
              ⚙️
            </button>
            <button 
              className="close-button"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="history-content">
          {history.length === 0 ? (
            <div className="empty-history">
              <p>No assessment history found.</p>
              <p>Complete an assessment to see your history here.</p>
            </div>
          ) : (
            <div className="history-layout">
              <div className="history-list">
                <div className="history-list-header">
                  <h3>Past Assessments</h3>
                  <button 
                    className="clear-all-button"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="history-items">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      className={`history-item ${selectedItem === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="history-item-header">
                        <span className="history-date">{formatDate(item.date)}</span>
                        <span className="history-stage">{item.stage}</span>
                      </div>
                      <div className="history-item-score">
                        <span 
                          className="score-value"
                          style={{ color: getScoreColor(item.overallScore) }}
                        >
                          {Math.round(item.overallScore)}
                        </span>
                        <span className="score-label">Overall Score</span>
                      </div>
                      <button 
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        aria-label="Delete assessment"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedItem && (
                <div className="history-details">
                  {history.find(item => item.id === selectedItem) && (
                    <HistoryItemDetails 
                      item={history.find(item => item.id === selectedItem)} 
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showSettings && <Settings onClose={handleCloseSettings} />}
    </div>
  );
};

// Component to display details of a history item
interface HistoryItemDetailsProps {
  item: any;
}

const HistoryItemDetails: React.FC<HistoryItemDetailsProps> = ({ item }) => {
  // Get color for score
  const getScoreColor = (score: number): string => {
    if (score >= 3.5) return '#4CAF50'; // Green
    if (score >= 2.5) return '#2196F3'; // Blue
    if (score >= 1.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  return (
    <div className="history-item-details">
      <h3>{item.stage} Assessment</h3>
      <p className="details-date">Completed on {new Date(item.date).toLocaleDateString()}</p>
      
      <div className="details-overall-score">
        <h4>Overall Score</h4>
        <div 
          className="overall-score-value"
          style={{ color: getScoreColor(item.overallScore) }}
        >
          {Math.round(item.overallScore)}
        </div>
      </div>
      
      <div className="details-category-scores">
        <h4>Category Scores</h4>
        <div className="category-scores-grid">
          {Object.entries(item.scores).map(([category, score]: [string, any]) => (
            <div key={category} className="category-score">
              <div className="category-name">{category}</div>
              <div 
                className="score-value"
                style={{ color: getScoreColor(score) }}
              >
                {score.toFixed(1)}
              </div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${(score / 4) * 100}%`,
                    backgroundColor: getScoreColor(score)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {item.personalizationData && (
        <div className="details-personalization">
          <h4>Personalization Data</h4>
          <div className="personalization-grid">
            <div className="personalization-item">
              <span className="item-label">Team Size:</span>
              <span className="item-value">{item.personalizationData.teamSize || 'Not specified'}</span>
            </div>
            <div className="personalization-item">
              <span className="item-label">Primary Language:</span>
              <span className="item-value">{item.personalizationData.primaryLanguage || 'Not specified'}</span>
            </div>
            <div className="personalization-item">
              <span className="item-label">Compliance Needs:</span>
              <span className="item-value">
                {item.personalizationData.complianceNeeds && item.personalizationData.complianceNeeds.length > 0
                  ? item.personalizationData.complianceNeeds.join(', ')
                  : 'None specified'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryDashboard; 