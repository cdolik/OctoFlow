import React from 'react';
import { Category } from '../data/questions';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  categoryScores: Record<Category, number>;
}

const RadarChart: React.FC<RadarChartProps> = ({ categoryScores }) => {
  // Prepare data for Chart.js
  const labels = Object.keys(categoryScores);
  const scores = Object.values(categoryScores);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Category Scores',
        data: scores,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };
  
  const options: ChartOptions<'radar'> = {
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: function(value) {
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
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw !== undefined ? Number(context.raw) : 0;
            return `${label}: ${value.toFixed(1)}/4.0`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="radar-chart">
      <Radar data={chartData} options={options} height={350} />
    </div>
  );
};

export default RadarChart; 