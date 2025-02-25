import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
  namespace jest {
    interface Matchers<R> {
      toBeValidScore(): R;
      toBeValidStage(): R;
      toBeStorageKey(): R;
      toBeChartInstance(): R;
      toBeValidRecommendation(): R;
      toHaveValidAssessmentState(): R;
    }
  }
  // Add setImmediate to global scope
  var setImmediate: {
    (handler: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate;
    readonly [Symbol.toStringTag]: string;
  };
}

interface MockChartInstance {
  destroy: jest.Mock;
  update: jest.Mock;
  data: {
    datasets: unknown[];
    labels: string[];
  };
  options: Record<string, unknown>;
}

interface MockChart {
  register: jest.Mock;
  Chart: jest.Mock<MockChartInstance>;
  Radar: jest.Mock;
}

// Enable API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock sessionStorage
const mockStorage = new Map<string, string>();
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => mockStorage.set(key, value)),
    removeItem: jest.fn((key: string) => mockStorage.delete(key)),
    clear: jest.fn(() => mockStorage.clear()),
    length: mockStorage.size,
    key: jest.fn((index: number) => Array.from(mockStorage.keys())[index])
  }
});

// Chart.js mock
const mockChart: MockChart = {
  register: jest.fn(),
  Chart: jest.fn(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      datasets: [],
      labels: []
    },
    options: {}
  })),
  Radar: jest.fn()
};

jest.mock('chart.js', () => ({
  ...mockChart,
  Chart: mockChart.Chart,
  register: mockChart.register,
  Radar: mockChart.Radar
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    status: 200,
    statusText: 'OK'
  })
) as jest.Mock;

// Polyfill for setImmediate
if (!global.setImmediate) {
  global.setImmediate = (fn: Function, ...args: unknown[]) => 
    setTimeout(fn, 0, ...args);
}

// Console error handling
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React does not recognize the') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('Warning: Cannot update a component') ||
       args[0]?.includes?.('React will try to recreate this component tree') ||
       args[0]?.includes?.('ErrorBoundary') ||
       /Error occurred in the error boundary/i.test(args[0]))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  private callback: ResizeObserverCallback;
  disconnect() { }
  observe() { }
  unobserve() { }
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  private callback: IntersectionObserverCallback;
  disconnect() { }
  observe() { }
  unobserve() { }
  takeRecords() { return []; }
};

// Mock window.performance
const originalPerformance = window.performance;
beforeAll(() => {
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      ...originalPerformance,
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn().mockReturnValue([]),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
    },
  });
});

// Custom matchers
expect.extend({
  toBeValidScore(received: unknown): jest.CustomMatcherResult {
    const pass = typeof received === 'number' && received >= 0 && received <= 4;
    return {
      message: () => `expected ${received} to be a valid score between 0 and 4`,
      pass
    };
  },
  toBeValidStage(received: unknown): jest.CustomMatcherResult {
    const validStages = ['pre-seed', 'seed', 'series-a', 'series-b'];
    const pass = validStages.includes(received as string);
    return {
      message: () => `expected ${received} to be one of: ${validStages.join(', ')}`,
      pass
    };
  },
  toBeStorageKey(received: unknown): jest.CustomMatcherResult {
    const pass = typeof received === 'string' && 
                (localStorage.getItem(received) !== null || 
                 sessionStorage.getItem(received) !== null);
    return {
      message: () => `expected ${received} to be a valid storage key`,
      pass
    };
  },
  toBeChartInstance(received: unknown): jest.CustomMatcherResult {
    const pass = received && 
                typeof received === 'object' && 
                'type' in (received as object) &&
                (received as { type: string }).type === 'radar';
    return {
      message: () => `expected ${received} to be a valid Chart.js radar instance`,
      pass
    };
  },
  toBeValidRecommendation(received: unknown): jest.CustomMatcherResult {
    const requiredKeys = ['id', 'title', 'priority', 'impact', 'effort', 'steps'];
    const pass = received && 
                typeof received === 'object' &&
                requiredKeys.every(key => key in (received as object));
    return {
      message: () => `expected ${received} to be a valid recommendation object with keys: ${requiredKeys.join(', ')}`,
      pass
    };
  },
  toHaveValidAssessmentState(received: unknown): jest.CustomMatcherResult {
    const pass = received && 
                typeof received === 'object' &&
                'responses' in (received as object) &&
                'currentStage' in (received as object) &&
                'progress' in (received as object);
    return {
      message: () => `expected ${received} to have valid assessment state with responses, currentStage, and progress`,
      pass
    };
  }
});

// Test cleanup
beforeEach(() => {
  mockStorage.clear();
  jest.resetModules();
  document.body.innerHTML = '';
  (fetch as jest.Mock).mockClear();
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  
  return new Promise<void>(resolve => {
    setImmediate(() => {
      const pendingTimers = jest.getTimerCount();
      if (pendingTimers > 0) {
        console.warn(
          `Test completed with ${pendingTimers} timer(s) still pending. ` +
          'This may cause test instability. Please ensure all timers are cleared.'
        );
      }
      resolve();
    });
  });
});