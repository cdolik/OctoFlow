import '@testing-library/jest-dom';
import { Chart } from 'chart.js';

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

// Mock sessionStorage
const mockStorage = {};
beforeAll(() => {
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: jest.fn(key => mockStorage[key]),
      setItem: jest.fn((key, value) => {
        mockStorage[key] = value;
      }),
      removeItem: jest.fn(key => {
        delete mockStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      })
    },
    writable: true
  });
});

// Reset any runtime handlers and storage
beforeEach(() => {
  jest.resetModules();
  window.sessionStorage.clear();
});

// Clean up after each test
afterEach(() => {
  // Clean up any attached elements
  document.body.innerHTML = '';
  
  // Clear any mocked handlers
  jest.clearAllMocks();
  
  // Reset Chart.js registrations
  Chart.register.mockClear();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Add custom matchers
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
  }
});
