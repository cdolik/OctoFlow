import React from 'react';
import { Category } from '../data/questions';

interface RadarChartProps {
  categoryScores: Record<Category, number>;
}

// This is a placeholder component since Chart.js isn't installed yet
// In the full implementation, we would:
// 1. Install dependencies: npm install chart.js react-chartjs-2
// 2. Import: import { Radar } from 'react-chartjs-2';
// 3. Implement a proper radar chart with the data

const RadarChart: React.FC<RadarChartProps> = ({ categoryScores }) => {
  return (
    <div className="radar-chart-placeholder">
      <h3>Radar Chart Visualization</h3>
      <p>In the complete implementation, this would be a radar chart displaying:</p>
      <ul>
        {Object.entries(categoryScores).map(([category, score]) => (
          <li key={category}>
            {category}: {score.toFixed(1)}
          </li>
        ))}
      </ul>
      <p className="note">
        Note: For the MVP, we're using this placeholder. The full implementation 
        would use Chart.js to render a proper radar chart.
      </p>
    </div>
  );
};

export default RadarChart; 