import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Stage } from './withFlowValidation';

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

    const labels = data.map(item => item.category);
    const scores = data.map(item => item.score);

    chartInstance.current = new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: `${stage} Assessment Results`,
            data: scores,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
          }
        ]
      },
      options: {
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: {
            display: false
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
