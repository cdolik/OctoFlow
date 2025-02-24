import { Chart } from 'chart.js';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { Stage, StageInfo } from 'octoflow';
import type { ReactElement, ComponentType } from 'react';
import React from 'react';
import { stages } from '../data/stages';
import { Stage, StorageState, AssessmentState } from '../types';
import { FLOW_STATES } from './flowValidator';

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
  'branch-strategy': 3,
  'pr-review': 4,
  'ci-practices': 3
};

interface MockState {
  stage: Stage;
  responses: Record<string, number>;
  flowState?: string;
  metadata?: {
    lastSaved: string;
    timeSpent: number;
    attemptCount: number;
    [key: string]: unknown;
  };
}

export const createMockState = ({
  stage = 'pre-seed',
  responses = {},
  flowState = FLOW_STATES.ASSESSMENT,
  metadata = {}
}: Partial<MockState> = {}): StorageState => {
  return {
    version: '1.1',
    currentStage: stage,
    responses,
    metadata: {
      lastSaved: new Date().toISOString(),
      timeSpent: 0,
      attemptCount: 1,
      ...metadata
    }
  };
};

export const createMockAssessmentState = (
  baseState: Partial<MockState> = {}
): AssessmentState => {
  const state = createMockState(baseState);
  return {
    ...state,
    progress: {
      questionIndex: 0,
      totalQuestions: 0,
      isComplete: false
    }
  };
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      Object.keys(store).forEach(key => delete store[key]);
    }
  };
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