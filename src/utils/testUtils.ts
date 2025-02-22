import { Chart } from 'chart.js';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { Stage, StageInfo } from 'octoflow';
import type { ReactElement, ComponentType } from 'react';
import React from 'react';
import { stages } from '../data/stages';

// Chart.js test utilities
export const mockChartInstance = (chartConfig = {}) => {
  const mockCanvas = document.createElement('canvas');
  mockCanvas.setAttribute('role', 'img');
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
    }
  };
};

// Radar chart specific test utility
interface RadarChartProps {
  data: Array<{ category: string; score: number }>;
  stage: string;
}

export const renderRadarChart = (
  Component: ComponentType<RadarChartProps>,
  props: Partial<RadarChartProps> = {}
) => {
  const defaultProps: RadarChartProps = {
    data: [],
    stage: 'pre-seed',
    ...props
  };
  const ElementType = Component;
  return render(React.createElement(ElementType, defaultProps));
};

// Router testing utility
interface RouterOptions {
  route?: string;
  paths?: string[];
}

export const renderWithRouter = (
  ui: ReactElement,
  { route = '/', paths = ['/'] }: RouterOptions = {}
) => {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries: [route] },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: paths[0], element: ui })
      )
    )
  );
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

interface MockStorageState {
  stage: Stage | null;
  responses: Record<string, number>;
  metadata?: {
    startTime: number;
    lastSaved: number;
    questionCount: number;
  };
}

export const createMockState = (
  stage: Stage = 'pre-seed',
  responses: Record<string, number> = {}
): MockStorageState => ({
  stage,
  responses,
  metadata: {
    startTime: Date.now() - 1000,
    lastSaved: Date.now(),
    questionCount: Object.keys(responses).length
  }
});

export const mockAssessmentFlow = async (stage: Stage): Promise<MockStorageState> => {
  sessionStorage.clear();
  const responses: Record<string, number> = {};
  const questionCount = 5;

  for (let i = 1; i <= questionCount; i++) {
    responses[`question${i}`] = Math.floor(Math.random() * 4) + 1;
  }

  return createMockState(stage, responses);
};

export const mockStorage = () => {
  const storage = new Map<string, string>();
  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    length: storage.size,
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
  };
};

export const mockAnalytics = () => ({
  trackStageSelect: jest.fn(),
  trackQuestionAnswer: jest.fn(),
  trackAssessmentComplete: jest.fn(),
  trackError: jest.fn(),
  trackResourceClick: jest.fn()
});

export const expectScoreInRange = (
  score: Record<string, number>,
  stage: Stage
): void => {
  const stageBenchmarks = stages.find(s => s.id === stage)?.benchmarks;
  if (!stageBenchmarks) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  const { expectedScores } = stageBenchmarks;
  Object.entries(expectedScores).forEach(([category, benchmark]) => {
    expect(score[category]).toBeDefined();
    expect(score[category]).toBeGreaterThanOrEqual(0);
    expect(score[category]).toBeLessThanOrEqual(4);
    expect(Math.abs(score[category] - benchmark)).toBeLessThanOrEqual(2);
  });
};

export const simulateError = (
  component: string,
  message = 'Test error'
): Error => {
  const error = new Error(message);
  error.stack = `Error: ${message}\n    at ${component}`;
  return error;
};

export const mockEvent = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
};