import { Chart } from 'chart.js';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Stage, StageInfo } from 'octoflow';

// Chart.js test utilities
export const mockChartInstance = (chartConfig = {}) => {
  const mockCanvas = document.createElement('canvas');
  const mockChart = new Chart(mockCanvas, {
    type: 'radar',
    data: {
      labels: [],
      datasets: []
    },
    options: {},
    ...chartConfig
  });

  return {
    mockCanvas,
    mockChart,
    getDatasets: () => mockChart.data.datasets,
    getOptions: () => mockChart.options,
    simulateHover: (datasetIndex: number, dataIndex: number) => {
      const event = new MouseEvent('mousemove', { bubbles: true });
      Object.defineProperty(event, 'offsetX', { get: () => dataIndex * 10 });
      Object.defineProperty(event, 'offsetY', { get: () => datasetIndex * 10 });
      mockCanvas.dispatchEvent(event);
    },
    simulateClick: (datasetIndex: number, dataIndex: number) => {
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'offsetX', { get: () => dataIndex * 10 });
      Object.defineProperty(event, 'offsetY', { get: () => datasetIndex * 10 });
      mockCanvas.dispatchEvent(event);
    }
  };
};

// Radar chart specific test utilities
export const renderRadarChart = (Component: React.ComponentType<any>, props = {}) => {
  const utils = render(<Component {...props} />);
  const canvas = screen.getByRole('img');
  
  return {
    ...utils,
    canvas,
    getChartInstance: () => Chart.getChart(canvas),
    // Additional radar chart specific assertions
    assertDatasetCount: (expected: number) => {
      const chart = Chart.getChart(canvas);
      expect(chart?.data.datasets.length).toBe(expected);
    },
    assertLabelsMatch: (expected: string[]) => {
      const chart = Chart.getChart(canvas);
      expect(chart?.data.labels).toEqual(expected);
    }
  };
};

// Testing utilities for chart animations and updates
export const waitForChartUpdate = async () => {
  // Wait for Chart.js animation frame and update cycle
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const cleanupChartTests = () => {
  // Clean up any chart instances that might be left over
  const charts = Object.values(Chart.instances);
  charts.forEach(chart => chart.destroy());
};

// Mock data for stages
export const mockStages: Stage[] = ['pre-seed', 'seed', 'series-a'];

export const mockStageInfo: StageInfo = {
  id: 'pre-seed',
  name: 'Pre-seed Stage'
};

export const mockResponses = {
  'pre-seed': { q1: 1, q2: 2 },
  'seed': { q1: 3, q2: 4 },
  'series-a': { q1: 5, q2: 6 }
};

// Render with router utility
export const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/' } = {}
) => {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(ui, {
      wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    })
  };
};

// Mock local storage utility
export const mockLocalStorage = () => {
  const storage = new Map();
  
  const mockImpl = {
    getItem: (key: string) => storage.get(key),
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    length: storage.size,
    key: (index: number) => Array.from(storage.keys())[index],
  };

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', { value: mockImpl });
    Object.defineProperty(window, 'sessionStorage', { value: mockImpl });
  });

  return mockImpl;
};