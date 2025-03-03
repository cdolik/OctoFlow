import React, { useEffect, useState } from 'react';
import { ComponentMetric } from '../types/performance';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ComponentMetric[]>([]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/performance/metrics', {
        headers: { 
          'x-api-key': process.env.REACT_APP_API_KEY || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h2>Performance Metrics</h2>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Render Time</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, idx) => (
            <tr key={idx}>
              <td>{metric.componentName}</td>
              <td>{metric.renderTime} ms</td>
              <td>{new Date(metric.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard; 