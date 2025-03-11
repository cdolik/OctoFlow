import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadState } from '../utils/storage';
import { withPerformanceTracking, usePerformanceTracking } from '../utils/performance';

const Summary: React.FC = () => {
  usePerformanceTracking('Summary');
  const navigate = useNavigate();
  const state = loadState();
  
  useEffect(() => {
    const loadSummaryWithPerf = async () => {
      const startTime = performance.now();
      try {
        if (!state || !state.responses || Object.keys(state.responses).length === 0) {
          navigate('/assessment');
          return;
        }

        const loadTime = performance.now() - startTime;
        if (process.env.NODE_ENV === 'development' && loadTime > 50) {
          console.debug(`[Performance] Summary data loading took ${loadTime.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error('Failed to load summary:', error);
      }
    };

    loadSummaryWithPerf();
  }, [navigate, state]);
  
  if (!state || !state.responses) {
    return (
      <div className="summary-loading text-center p-6">
        <p>Loading summary data...</p>
      </div>
    );
  }
  
  return (
    <div className="summary-container max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Assessment Summary</h1>
      
      <div className="summary-card bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-medium mb-4">Your Responses</h2>
        
        <div className="responses-list">
          <ul className="list-disc pl-6 space-y-2">
            {Object.entries(state.responses).map(([id, response]) => {
              // Type check the response object
              if (response && typeof response === 'object' && 'value' in response) {
                return (
                  <li key={id}>
                    Question {id}: {response.value ? 'Yes' : 'No'}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
      
      <div className="actions flex justify-between">
        <button 
          onClick={() => navigate('/results')}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Back to Results
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

// Wrap with performance tracking
export default withPerformanceTracking(Summary, 'Summary');
