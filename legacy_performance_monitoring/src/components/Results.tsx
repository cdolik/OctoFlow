import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadState } from '../utils/storage';
import { getRecommendationsByScores } from '../data/recommendations';
import { Recommendation, ResultsProps } from '../types';
import { withPerformanceTracking, usePerformanceTracking } from '../utils/performance';

const Results: React.FC<ResultsProps> = ({ onStartOver }) => {
  usePerformanceTracking('Results');
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateResultsWithPerf = async () => {
      const startTime = performance.now();
      try {
        const savedState = loadState();
        
        if (!savedState || !savedState.responses) {
          navigate('/assessment');
          return;
        }
        
        // Calculate scores with performance tracking
        const scoreStartTime = performance.now();
        const scores: Record<string, number> = {};
        Object.entries(savedState.responses).forEach(([id, response]) => {
          const category = id.split('-')[0];
          if (!scores[category]) {
            scores[category] = 0;
          }
          
          if (response && typeof response === 'object' && 'value' in response && response.value === true) {
            scores[category] += 1;
          }
        });
        const scoreTime = performance.now() - scoreStartTime;
        
        // Get recommendations with performance tracking
        const recStartTime = performance.now();
        const recs = getRecommendationsByScores(scores);
        const recTime = performance.now() - recStartTime;
        
        setRecommendations(recs);
        setLoading(false);

        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[Performance] Results calculation breakdown:
            - Total time: ${(performance.now() - startTime).toFixed(2)}ms
            - Score calculation: ${scoreTime.toFixed(2)}ms
            - Recommendation generation: ${recTime.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Failed to load results:', error);
        setLoading(false);
      }
    };

    calculateResultsWithPerf();
  }, [navigate]);
  
  const handleStartOver = () => {
    if (onStartOver) {
      onStartOver();
    }
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="results-loading text-center p-6">
        <div className="spinner mb-4">Loading...</div>
        <p>Analyzing your responses...</p>
      </div>
    );
  }
  
  return (
    <div className="results-container max-w-5xl mx-auto p-6" role="main" aria-labelledby="results-title">
      <h1 id="results-title" className="text-3xl font-bold mb-6">Your GitHub Action Recommendations</h1>
      
      {recommendations.length === 0 ? (
        <div className="no-recommendations bg-gray-100 rounded-lg p-6 text-center" role="alert">
          <p className="text-lg mb-4">No recommendations found based on your responses.</p>
          <button 
            onClick={handleStartOver}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            aria-label="Start assessment over"
          >
            Take Assessment Again
          </button>
        </div>
      ) : (
        <>
          <div className="recommendations-list divide-y" role="list">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-item py-4" role="listitem">
                <div 
                  className={`priority-badge inline-block px-2 py-1 rounded mr-2 text-xs text-white ${
                    rec.priority === 'high' ? 'bg-red-600' : 
                    rec.priority === 'medium' ? 'bg-orange-500' : 'bg-green-600'
                  }`}
                  role="status"
                  aria-label={`Priority: ${rec.priority}`}
                >
                  {rec.priority.toUpperCase()}
                </div>
                <h3 className="text-xl font-medium mt-2">{rec.title}</h3>
                <div className="mt-3">
                  <a 
                    href={rec.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                    aria-label={`View ${rec.title} on GitHub (opens in new tab)`}
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="actions mt-8 flex justify-between">
            <button 
              onClick={handleStartOver}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
              aria-label="Start assessment over"
            >
              Start Over
            </button>
            <button 
              onClick={() => navigate('/summary')}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
              aria-label="View assessment summary"
            >
              Finish
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Wrap with performance tracking
export default withPerformanceTracking(Results, 'Results');
