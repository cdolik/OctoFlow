import React from 'react';
import { render, screen } from '@testing-library/react';
import RadarChart from '../components/RadarChart';
import { Chart as ChartJS } from 'chart.js';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
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
    // Clear mock calls between tests
    (ChartJS as jest.Mock).mockClear();
  });

  it('initializes Chart.js with correct data', () => {
    render(<RadarChart data={mockData} stage="pre-seed" />);
    
    const chartConfig = (ChartJS as jest.Mock).mock.calls[0][1];
    
    // Verify data transformation
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
    
    // Verify old instance was destroyed
    const destroyMock = (ChartJS as jest.Mock).mock.instances[0].destroy;
    expect(destroyMock).toHaveBeenCalled();
    
    // Verify new instance was created with updated data
    const latestCall = (ChartJS as jest.Mock).mock.calls.length - 1;
    const newChartConfig = (ChartJS as jest.Mock).mock.calls[latestCall][1];
    expect(newChartConfig.data.datasets[0].data).toHaveLength(4);
  });

  it('cleans up chart instance on unmount', () => {
    const { unmount } = render(<RadarChart data={mockData} stage="pre-seed" />);
    
    unmount();
    
    const destroyMock = (ChartJS as jest.Mock).mock.instances[0].destroy;
    expect(destroyMock).toHaveBeenCalled();
  });

  it('renders with benchmark data for the selected stage', () => {
    render(<RadarChart data={mockData} stage="pre-seed" />);
    
    const chartConfig = (ChartJS as jest.Mock).mock.calls[0][1];
    expect(chartConfig.data.datasets).toHaveLength(2);
    expect(chartConfig.data.datasets[1].label).toContain('Pre Seed Benchmark');
  });
});