import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { Chart } from 'chart.js';

// Enhanced storage mock with persistence
class StorageMock {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.get(key) || null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(n) {
    return [...this.store.keys()][n];
  }
}

// Create storage instances
const localStorage = new StorageMock();
const sessionStorage = new StorageMock();

// Mock storage
Object.defineProperty(window, 'localStorage', { value: localStorage });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorage });

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
    defaults: {
      responsive: true,
      maintainAspectRatio: false
    }
  },
  RadialLinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Filler: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
    status: 200,
    statusText: "OK"
  })
);

// Better console error handling
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React does not recognize the') ||
       args[0].includes('Warning: An update to') ||
       args[0].includes('Warning: Cannot update a component'))
    ) {
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
  localStorage.clear();
  sessionStorage.clear();
  jest.resetModules();
  document.body.innerHTML = '';
  fetch.mockClear();
});

afterEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();
  Chart.register.mockClear();
  
  // Reset all timers and provide better error context
  if (jest.getTimerCount() > 0) {
    console.warn(`Test completed with ${jest.getTimerCount()} timers still running`);
    jest.useRealTimers();
  }
  
  // Clear any queued microtasks and provide error context for async operations
  return Promise.resolve().then(() => {
    const pendingTimers = jest.getTimerCount();
    if (pendingTimers > 0) {
      console.warn(`Clean up completed with ${pendingTimers} timers still pending`);
    }
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
