import './setupPolyfills';
import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

// Add TransformStream polyfill for MSW - using a synchronous approach for Jest
if (typeof TransformStream === 'undefined') {
  // Simple mock implementation of TransformStream for tests
  global.TransformStream = class TransformStream {
    constructor() {
      this.readable = {};
      this.writable = {};
    }
  };
}

import { server } from './mocks/server';

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// Server mocks
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Storage mock setup
const mockStorage = new Map();

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => mockStorage.get(key)),
    setItem: jest.fn((key, value) => mockStorage.set(key, value)),
    removeItem: jest.fn((key) => mockStorage.delete(key)),
    clear: jest.fn(() => mockStorage.clear()),
    length: mockStorage.size,
    key: jest.fn((index) => Array.from(mockStorage.keys())[index])
  },
  writable: true
});

// Chart.js mock with proper radar chart support
const mockChart = {
  register: jest.fn(),
  Chart: jest.fn(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      datasets: [{
        data: [],
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderColor: '#000',
        pointBackgroundColor: '#000'
      }],
      labels: []
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          min: 0,
          max: 4,
          ticks: { stepSize: 1 }
        }
      }
    },
    type: 'radar',
    getDatasetMeta: jest.fn(() => ({
      data: [],
      type: 'radar'
    }))
  })),
  Radar: jest.fn()
};

jest.mock('chart.js', () => ({
  ...mockChart,
  Chart: mockChart.Chart,
  register: mockChart.register,
  Radar: mockChart.Radar
}));

// Setup fetch mock properly
// Instead of directly assigning a mock function, use jest-fetch-mock
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Console error handling - consolidated into one place
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React does not recognize the') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('Warning: Cannot update a component') ||
       args[0]?.includes?.('React will try to recreate this component tree') ||
       args[0]?.includes?.('ErrorBoundary') ||
       /Error occurred in the error boundary/i.test(args[0] || '') ||
       args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
});

// Browser API mocks
const createMatchMedia = (matches) => (query) => ({
  matches,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

window.matchMedia = createMatchMedia(true);

// Mock observers
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observables = new Set();
  }

  observe(element) {
    this.observables.add(element);
  }

  unobserve(element) {
    this.observables.delete(element);
  }

  disconnect() {
    this.observables.clear();
  }

  // Trigger a resize
  mockResize(element, rect) {
    if (this.observables.has(element)) {
      this.callback([
        {
          target: element,
          contentRect: rect,
          borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
          contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }]
        }
      ]);
    }
  }
}

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observables = new Set();
  }

  observe(element) {
    this.observables.add(element);
  }

  unobserve(element) {
    this.observables.delete(element);
  }

  disconnect() {
    this.observables.clear();
  }

  // Trigger intersection
  mockIntersection(element, isIntersecting) {
    if (this.observables.has(element)) {
      this.callback([
        {
          target: element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: element.getBoundingClientRect()
        }
      ]);
    }
  }
}

global.ResizeObserver = ResizeObserverMock;
global.IntersectionObserver = IntersectionObserverMock;

// Test lifecycle hooks
beforeEach(() => {
  // Clear all mocks and state
  mockStorage.clear();
  jest.resetModules();
  document.body.innerHTML = '';
  fetchMock.resetMocks(); // Use fetchMock instead of fetch.mockClear()
  jest.clearAllMocks();
  
  // Always start with fake timers with legacy mode enabled
  jest.useFakeTimers({ legacyFakeTimers: true });
  
  // Clear storage
  sessionStorage.clear();
  localStorage.clear();
  
  // Reset Chart.js mock
  mockChart.Chart.mockClear();
  mockChart.register.mockClear();
  mockChart.Radar.mockClear();
});

afterEach(() => {
  // Clean up DOM
  document.body.innerHTML = '';
  
  // Handle timers properly - check if timers are mock before calling
  if (jest.isMockFunction(setTimeout)) {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  }
  
  // Clear storage
  sessionStorage.clear();
  localStorage.clear();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  jest.restoreAllMocks();
});

// Custom matchers
expect.extend({
  toBeValidScore(received) {
    const pass = typeof received === 'number' && received >= 1 && received <= 4;
    return {
      pass,
      message: () =>
        `expected ${received} to be a valid score between 1 and 4`
    };
  },
  toBeValidStage(received) {
    const validStages = ['pre-seed', 'seed', 'series-a', 'series-b'];
    const pass = validStages.includes(received);
    return {
      message: () => `expected ${received} to be one of: ${validStages.join(', ')}`,
      pass
    };
  },
  toBeStorageKey(received) {
    const pass = typeof received === 'string' && 
                (localStorage.getItem(received) !== null || 
                 sessionStorage.getItem(received) !== null);
    return {
      message: () => `expected ${received} to be a valid storage key`,
      pass
    };
  },
  toBeChartInstance(received) {
    const pass = received && 
                typeof received === 'object' && 
                received.type === 'radar';
    return {
      message: () => `expected ${received} to be a valid Chart.js radar instance`,
      pass
    };
  },
  toBeValidRecommendation(received) {
    const requiredKeys = ['id', 'title', 'priority', 'impact', 'effort', 'steps'];
    const pass = received && 
                typeof received === 'object' &&
                requiredKeys.every(key => key in received);
    return {
      message: () => `expected ${received} to be a valid recommendation object with keys: ${requiredKeys.join(', ')}`,
      pass
    };
  },
  toHaveValidAssessmentState(received) {
    const pass = received && 
                typeof received === 'object' &&
                'responses' in received &&
                'currentStage' in received &&
                'progress' in received;
    return {
      message: () => `expected ${received} to have valid assessment state with responses, currentStage, and progress`,
      pass
    };
  }
});
