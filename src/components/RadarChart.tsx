import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { Stage } from '../types';
import { stageConfig } from '../data/StageConfig';

Chart.register(...registerables);

interface RadarChartProps {
  categories: string[];
  values: number[];
  benchmarks: Record<string, number>;
  stage?: Stage;
  height?: number;
  width?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  categories,
  values,
  benchmarks,
  stage,
  height = 300,
  width = 300
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config = {
      type: 'radar' as const,
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Your Score',
            data: values,
            backgroundColor: 'rgba(45, 164, 78, 0.2)',
            borderColor: '#2DA44E',
            borderWidth: 2,
          },
          {
            label: stage ? `${stageConfig[stage]?.label || stage} Benchmark` : 'Benchmark',
            data: categories.map(label => benchmarks[label] || 0),
            backgroundColor: 'rgba(36, 41, 46, 0.1)',
            borderColor: '#24292E',
            borderWidth: 1,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 4,
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
                weight: 500
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
            position: 'bottom' as const,
            labels: {
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.raw.toFixed(1);
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    };

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, config);

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [categories, values, benchmarks, stage]);

  return (
    <div className="radar-chart-container">
      <canvas 
        ref={chartRef}
        height={height}
        width={width}
        aria-label="Radar chart showing assessment scores and benchmarks"
      />
    </div>
  );
};
