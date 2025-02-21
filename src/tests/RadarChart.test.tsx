import React from 'react';
import { render } from '@testing-library/react';
import RadarChart from '../components/RadarChart';

interface ChartConfig {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      label?: string;
    }>;
  };
}

const MockChart = jest.fn((canvas: HTMLCanvasElement, config: ChartConfig) => ({
  destroy: jest.fn(),
  update: jest.fn(),
  config
}));

jest.mock('chart.js', () => ({
  __esModule: true,
  Chart: MockChart,
  RadialLinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Filler: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  register: jest.fn()
}));

describe('RadarChart', () => {
  const mockData = [
    { category: 'github-ecosystem', score: 75 },
    { category: 'security', score: 50 },
    { category: 'team-growth', score: 85 }
  ];

  beforeEach(() => {
    MockChart.mockClear();
  });

  it('initializes Chart.js with correct data', () => {
    render(<RadarChart data={mockData} stage="pre-seed" />);
    
    const call = MockChart.mock.calls[0];
    expect(call).toBeDefined();
    
    const chartConfig = call[1] as ChartConfig;
    expect(chartConfig.data.labels).toEqual([
      'Github Ecosystem',
      'Security',
      'Team Growth'
    ]);
    expect(chartConfig.data.datasets[0].data).toEqual([75, 50, 85]);
  });

  it('updates chart when data changes', () => {
    const { rerender } = render(<RadarChart data={mockData} stage="pre-seed" />);
    
    const newData = [...mockData, { category: 'ai-adoption', score: 90 }];
    rerender(<RadarChart data={newData} stage="pre-seed" />);
    
    const destroyMock = MockChart.mock.instances[0]?.destroy;
    expect(destroyMock).toBeDefined();
    expect(destroyMock).toHaveBeenCalled();
    
    const latestCall = MockChart.mock.calls[MockChart.mock.calls.length - 1];
    expect(latestCall).toBeDefined();
    
    const newChartConfig = latestCall[1] as ChartConfig;
    expect(newChartConfig.data.datasets[0].data).toHaveLength(4);
  });

  it('cleans up chart instance on unmount', () => {
    const { unmount } = render(<RadarChart data={mockData} stage="pre-seed" />);
    
    unmount();
    
    const destroyMock = MockChart.mock.instances[0]?.destroy;
    expect(destroyMock).toBeDefined();
    expect(destroyMock).toHaveBeenCalled();
  });

  it('renders with benchmark data for the selected stage', () => {
    render(<RadarChart data={mockData} stage="pre-seed" />);
    
    const call = MockChart.mock.calls[0];
    expect(call).toBeDefined();
    
    const chartConfig = call[1] as ChartConfig;
    expect(chartConfig.data.datasets).toHaveLength(2);
    expect(chartConfig.data.datasets[1].label).toContain('Pre Seed Benchmark');
  });
});