import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Stage } from './withFlowValidation';
import { stages } from '../data/categories';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface DataPoint {
  category: string;
  score: number;
}

interface RadarChartProps {
  data: DataPoint[];
  stage: Stage;
}

const getCategoryColor = (category: string): string => {
  const colors = {
    'github-ecosystem': 'rgb(46, 164, 79)',    // GitHub green
    'security': 'rgb(203, 36, 49)',            // Security red
    'team-growth': 'rgb(121, 184, 255)',       // Blue
    'developer-experience': 'rgb(249, 130, 108)', // Orange
    'ai-adoption': 'rgb(130, 80, 223)',        // Purple
    'automation': 'rgb(255, 153, 0)'           // Automation orange
  };
  return colors[category as keyof typeof colors] || 'rgb(54, 162, 235)';
};

const formatCategoryLabel = (category: string): string => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function RadarChart({ data, stage }: RadarChartProps): JSX.Element {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Cleanup previous instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.map(item => formatCategoryLabel(item.category));
    const scores = data.map(item => item.score);
    const benchmarks = stages.find(s => s.id === stage)?.benchmarks.expectedScores || {};

    chartInstance.current = new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Your Results',
            data: scores,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            pointBackgroundColor: data.map(item => getCategoryColor(item.category)),
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: data.map(item => getCategoryColor(item.category)),
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: `${formatCategoryLabel(stage)} Benchmark`,
            data: data.map(item => (benchmarks[item.category] || 0) * 25), // Convert 1-4 scale to percentage
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderColor: 'rgba(255, 99, 132, 0.6)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: (value) => `${value}%`
            },
            pointLabels: {
              font: {
                size: 12,
                weight: '500'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            padding: 12,
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const datasetLabel = context.dataset.label || '';
                return `${datasetLabel}: ${value}%`;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.1
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, stage]);

  return (
    <div className="radar-chart-container">
      <canvas ref={chartRef} />
    </div>
  );
}
