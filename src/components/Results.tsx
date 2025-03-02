import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadState } from '../utils/storage';
import { getRecommendationsByScores } from '../data/recommendations';
import { Recommendation, ResultsProps } from '../types';

const Results: React.FC<ResultsProps> = ({ onStartOver }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedState = loadState();
      
      if (!savedState || !savedState.responses) {
        // If no saved state, redirect to assessment
        navigate('/assessment');
        return;
      }
      
      // Calculate simple scores based on responses
      const scores: Record<string, number> = {};
      Object.entries(savedState.responses).forEach(([id, response]) => {
        const category = id.split('-')[0];
        if (!scores[category]) {
          scores[category] = 0;
        }
        
        // Add 1 to the score for "Yes" answers
        if (response && typeof response === 'object' && 'value' in response && response.value === true) {
          scores[category] += 1;
        }
      });
      
      // Get recommendations based on scores
      const recs = getRecommendationsByScores(scores);
      setRecommendations(recs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load results:', error);
      setLoading(false);
    }
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
    <div className="results-container max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your GitHub Action Recommendations</h1>
      
      {recommendations.length === 0 ? (
        <div className="no-recommendations bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-lg mb-4">No recommendations found based on your responses.</p>
          <button 
            onClick={handleStartOver}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Take Assessment Again
          </button>
        </div>
      ) : (
        <>
          <div className="recommendations-list divide-y">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-item py-4">
                <div className={`priority-badge inline-block px-2 py-1 rounded mr-2 text-xs text-white ${
                  rec.priority === 'high' ? 'bg-red-600' : 
                  rec.priority === 'medium' ? 'bg-orange-500' : 'bg-green-600'
                }`}>
                  {rec.priority.toUpperCase()}
                </div>
                <h3 className="text-xl font-medium mt-2">{rec.text}</h3>
                <div className="mt-3">
                  <a 
                    href={rec.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
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
            >
              Start Over
            </button>
            <button 
              onClick={() => navigate('/summary')}
              className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
            >
              Finish
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
