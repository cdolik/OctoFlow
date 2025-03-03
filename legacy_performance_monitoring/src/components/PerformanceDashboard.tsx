import React, { useEffect, useState } from 'react';
import { ComponentMetric } from '../utils/performance';
import { PERFORMANCE_CONFIG } from '../utils/performance.config';

interface Metric {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/performance/metrics', {
        headers: { 'x-api-key': 'test-api-key' }
      });
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      } else {
        setError('Failed to fetch metrics');
      }
    } catch (e) {
      setError('Error connecting to server');
      console.error('Error fetching metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderMetricsTable = (metrics: Metric[]) => (
    <table className="min-w-full bg-white shadow-md rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Component
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Render Time (ms)
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Timestamp
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {metrics.map((metric, index) => (
          <tr 
            key={`${metric.componentName}-${metric.timestamp}-${index}`}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {metric.componentName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {metric.renderTime.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(metric.timestamp).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchMetrics}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Performance Metrics</h2>
      {loading ? (
        <p>Loading metrics...</p>
      ) : metrics.length === 0 ? (
        <p>No metrics available</p>
      ) : (
        <div className="metrics-table-container">
          {renderMetricsTable(metrics)}
        </div>
      )}
      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .metrics-table-container {
          overflow-x: auto;
        }
        
        .metrics-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .metrics-table th,
        .metrics-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .metrics-table th {
          background: #f5f5f5;
          font-weight: 600;
        }
        
        .metrics-table tr:hover {
          background: #f9f9f9;
        }
        
        .error-container {
          padding: 20px;
          text-align: center;
        }
        
        .error-message {
          color: #dc3545;
          margin-bottom: 10px;
        }
        
        button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard; 