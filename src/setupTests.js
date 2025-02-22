import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null)
  },
  writable: true
});

// Chart.js mock
const mockChart = {
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

// Mock sessionStorage
const mockStorage = new Map();

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => mockStorage.get(key)),
    setItem: jest.fn((key, value) => mockStorage.set(key, value)),
    removeItem: jest.fn((key) => mockStorage.delete(key)),
    clear: jest.fn(() => mockStorage.clear()),
    length: mockStorage.size,
    key: jest.fn((index) => Array.from(mockStorage.keys())[index])
  }
});

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
);

// Polyfill for setImmediate if needed
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// Better console error handling
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
       /Error occurred in the error boundary/i.test(args[0] || '')
    )) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
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

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  fetch.mockClear();
});

// Mock window.matchMedia with better device simulation
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

// Default to desktop view
window.matchMedia = createMatchMedia(true);

// Mock ResizeObserver
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

global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
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

global.IntersectionObserver = IntersectionObserverMock;

// Test cleanup
beforeEach(() => {
  mockStorage.clear();
  jest.resetModules();
  document.body.innerHTML = '';
  fetch.mockClear();
  jest.useFakeTimers();
  jest.clearAllMocks();
  global.fetch.mockClear();
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
  
  // Clear all timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  
  // Verify no timers are leaked
  return new Promise(resolve => {
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

// Custom matchers
expect.extend({
  toBeValidScore(received) {
    const pass = typeof received === 'number' && received >= 0 && received <= 4;
    return {
      message: () => `expected ${received} to be a valid score between 0 and 4`,
      pass
    };
  },
  toBeValidStage(received) {
    const validStages = ['pre-seed', 'seed', 'series-a'];
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

// Enhanced error boundary testing
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0]?.includes?.('React will try to recreate this component tree') ||
      args[0]?.includes?.('ErrorBoundary') ||
      /Error occurred in the error boundary/i.test(args[0] || '')
    ) {
      return; // Suppress expected error boundary messages
    }
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

if (typeof setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
