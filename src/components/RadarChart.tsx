import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartData } from 'chart.js';

interface RadarChartProps {
  data: ChartData;
}

const RadarChart = ({ data }: RadarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current?.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: 'radar',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }

    return () => {
      chartInstance.current?.destroy();
    };
  }, [data]);

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default RadarChart;
