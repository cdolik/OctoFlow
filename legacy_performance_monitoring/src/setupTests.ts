import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import fc from 'fast-check';

// Minimal test configuration
const TEST_CONFIG = {
  propertyBased: {
    numRuns: 10,
    timeout: 5000,
    skipAfter: 10000
  }
};

// Configure fast-check
fc.configureGlobal({
  numRuns: TEST_CONFIG.propertyBased.numRuns,
  interruptAfterTimeLimit: TEST_CONFIG.propertyBased.timeout,
  skipAllAfterTimeLimit: TEST_CONFIG.propertyBased.skipAfter
});

// Extend global interfaces for testing
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
}

// Enable API mocking
beforeAll(() => {
  // Placeholder for server mocking if needed
});

afterEach(() => {
  cleanup();
});

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

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      datasets: [],
      labels: []
    },
    options: {}
  })),
  register: jest.fn(),
  Radar: jest.fn()
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

// Polyfill for setImmediate with correct type
global.setImmediate = ((fn: (...args: unknown[]) => void, ...args: unknown[]) => 
  setTimeout(fn, 0, ...args)) as any;

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

// Mock IntersectionObserver with full type compatibility
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    callback: IntersectionObserverCallback, 
    options?: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? '0px';
    this.thresholds = options?.threshold ? 
      (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : 
      [0];
  }
  private callback: IntersectionObserverCallback;
  root: Element | Document | null;
  rootMargin: string;
  thresholds: number[];
  
  disconnect() { }
  observe() { }
  unobserve() { }
  takeRecords() { return []; }
};

// Custom matchers
expect.extend({
  toBeValidScore(received: unknown): jest.CustomMatcherResult {
    const pass = typeof received === 'number' && received >= 0 && received <= 4;
    return {
      message: () => `expected ${received} to be a valid score between 0 and 4`,
      pass: pass as boolean
    };
  },
  toBeValidStage(received: unknown): jest.CustomMatcherResult {
    const validStages = ['pre-seed', 'seed', 'series-a', 'series-b'];
    const pass = validStages.includes(received as string);
    return {
      message: () => `expected ${received} to be one of: ${validStages.join(', ')}`,
      pass: pass as boolean
    };
  },
  toBeStorageKey(received: unknown): jest.CustomMatcherResult {
    const pass = typeof received === 'string' && 
                (localStorage.getItem(received) !== null || 
                 sessionStorage.getItem(received) !== null);
    return {
      message: () => `expected ${received} to be a valid storage key`,
      pass: pass as boolean
    };
  },
  toBeChartInstance(received: unknown): jest.CustomMatcherResult {
    const pass = received && 
                typeof received === 'object' && 
                'type' in (received as object) &&
                (received as { type: string }).type === 'radar';
    return {
      message: () => `expected ${received} to be a valid Chart.js radar instance`,
      pass: pass as boolean
    };
  },
  toBeValidRecommendation(received: unknown): jest.CustomMatcherResult {
    const requiredKeys = ['id', 'title', 'priority', 'impact', 'effort', 'steps'];
    const pass = received && 
                typeof received === 'object' &&
                requiredKeys.every(key => key in (received as object));
    return {
      message: () => `expected ${received} to be a valid recommendation object with keys: ${requiredKeys.join(', ')}`,
      pass: pass as boolean
    };
  },
  toHaveValidAssessmentState(received: unknown): jest.CustomMatcherResult {
    const pass = received && 
                typeof received === 'object';
    return {
      message: () => `expected ${received} to be a valid assessment state object`,
      pass: pass as boolean
    };
  }
});