import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category } from '../data/questions';
import { AssessmentResult, getAssessmentHistory, deleteAssessmentFromHistory } from '../utils/storage';
import { Radar } from 'react-chartjs-2';
import Settings from './Settings';

interface HistoryDashboardProps {
  onClose: () => void;
}

const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ onClose }) => {
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<AssessmentResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);
  
  // Load history data
  const loadHistory = () => {
    const assessmentHistory = getAssessmentHistory();
    setHistory(assessmentHistory);
    
    // Select the most recent result by default
    if (assessmentHistory.length > 0) {
      setSelectedResult(assessmentHistory[0]);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle result selection
  const handleSelectResult = (result: AssessmentResult) => {
    setSelectedResult(result);
  };
  
  // Handle comparison selection
  const handleCompareResult = (result: AssessmentResult) => {
    if (selectedResult && result.id === selectedResult.id) {
      // Can't compare with itself
      return;
    }
    setComparisonResult(result);
  };
  
  // Handle result deletion
  const handleDeleteResult = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment result?')) {
      deleteAssessmentFromHistory(id);
      
      // Update local state
      const updatedHistory = history.filter(result => result.id !== id);
      setHistory(updatedHistory);
      
      // Update selected result if needed
      if (selectedResult && selectedResult.id === id) {
        setSelectedResult(updatedHistory.length > 0 ? updatedHistory[0] : null);
      }
      
      // Update comparison result if needed
      if (comparisonResult && comparisonResult.id === id) {
        setComparisonResult(null);
      }
    }
  };
  
  // Clear comparison
  const clearComparison = () => {
    setComparisonResult(null);
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
  
  // Prepare chart data for comparison
  const prepareComparisonChartData = () => {
    if (!selectedResult) return null;
    
    const labels = Object.keys(selectedResult.categoryScores);
    const datasets = [
      {
        label: `${selectedResult.stage} - ${formatDate(selectedResult.date).split(' ')[0]}`,
        data: Object.values(selectedResult.categoryScores),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      }
    ];
    
    if (comparisonResult) {
      datasets.push({
        label: `${comparisonResult.stage} - ${formatDate(comparisonResult.date).split(' ')[0]}`,
        data: Object.values(comparisonResult.categoryScores),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
      });
    }
    
    return {
      labels,
      datasets
    };
  };
  
  // Chart options
  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return value.toString();
          }
        },
        pointLabels: {
          font: {
            size: 14
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw !== undefined ? Number(context.raw) : 0;
            return `${label}: ${value.toFixed(1)}/4.0`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <>
      <div className="history-dashboard">
        <div className="history-header">
          <h2>Assessment History</h2>
          <div className="history-header-actions">
            <button onClick={handleOpenSettings} className="settings-button">
              ⚙️ Settings
            </button>
            <button onClick={onClose} className="close-button">×</button>
          </div>
        </div>
        
        <div className="history-content">
          <div className="history-sidebar">
            <h3>Past Assessments</h3>
            {history.length === 0 ? (
              <p className="no-history">No assessment history found.</p>
            ) : (
              <motion.ul 
                className="history-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {history.map(result => (
                  <motion.li 
                    key={result.id}
                    className={`history-item ${selectedResult?.id === result.id ? 'selected' : ''} ${comparisonResult?.id === result.id ? 'comparison' : ''}`}
                    variants={itemVariants}
                    onClick={() => handleSelectResult(result)}
                  >
                    <div className="history-item-header">
                      <span className="history-item-stage">{result.stage}</span>
                      <span className="history-item-date">{formatDate(result.date)}</span>
                    </div>
                    <div className="history-item-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompareResult(result);
                        }}
                        disabled={selectedResult?.id === result.id}
                        className="compare-button"
                      >
                        Compare
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResult(result.id);
                        }}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
          
          <div className="history-details">
            {selectedResult ? (
              <>
                <div className="history-details-header">
                  <h3>{selectedResult.stage} Assessment</h3>
                  <p className="history-details-date">{formatDate(selectedResult.date)}</p>
                  
                  {comparisonResult && (
                    <div className="comparison-header">
                      <p>Comparing with: {comparisonResult.stage} ({formatDate(comparisonResult.date)})</p>
                      <button onClick={clearComparison} className="clear-comparison-button">
                        Clear Comparison
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="history-chart">
                  <Radar 
                    data={prepareComparisonChartData() as any} 
                    options={chartOptions as any} 
                    height={350}
                  />
                </div>
                
                <div className="history-scores">
                  <h4>Category Scores</h4>
                  <div className="history-score-grid">
                    {Object.entries(selectedResult.categoryScores).map(([category, score]) => {
                      const comparisonScore = comparisonResult ? comparisonResult.categoryScores[category as Category] : null;
                      const scoreDiff = comparisonScore !== null ? score - comparisonScore : null;
                      
                      return (
                        <div key={category} className="history-score-item">
                          <div className="history-score-label">{category}</div>
                          <div className="history-score-value">
                            {score.toFixed(1)}
                            {scoreDiff !== null && (
                              <span className={`score-diff ${scoreDiff > 0 ? 'positive' : scoreDiff < 0 ? 'negative' : 'neutral'}`}>
                                {scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="history-score-bar">
                            <div className="history-score-fill" style={{ width: `${(score / 4) * 100}%` }}></div>
                            {comparisonScore !== null && (
                              <div className="history-comparison-marker" style={{ left: `${(comparisonScore / 4) * 100}%` }}></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select an assessment from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showSettings && <Settings onClose={handleCloseSettings} />}
    </>
  );
};

export default HistoryDashboard; 