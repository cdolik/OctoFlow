import { saveState, loadState, clearState } from './storage';
import { Stage } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('saveState saves data to localStorage', () => {
    const testState = {
      currentStage: Stage.Assessment,
      responses: {
        'q1': { value: true, timestamp: 1623456789 },
        'q2': { value: false, timestamp: 1623456790 }
      }
    };

    saveState(testState);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'octoflow-assessment',
      JSON.stringify(testState)
    );
  });

  test('loadState retrieves data from localStorage', () => {
    const testState = {
      currentStage: Stage.Assessment,
      responses: {
        'q1': { value: true, timestamp: 1623456789 },
        'q2': { value: false, timestamp: 1623456790 }
      }
    };

    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(testState));
    const result = loadState();

    expect(localStorageMock.getItem).toHaveBeenCalledWith('octoflow-assessment');
    expect(result).toEqual(testState);
  });

  test('loadState returns null when no data exists', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    const result = loadState();

    expect(result).toBeNull();
  });

  test('clearState removes data from localStorage', () => {
    clearState();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('octoflow-assessment');
  });

  test('handles error when localStorage throws', () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Test saveState error handling
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    saveState({ currentStage: Stage.Assessment, responses: {} });
    expect(console.error).toHaveBeenCalled();

    // Test loadState error handling
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    const result = loadState();
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();

    // Test clearState error handling
    localStorageMock.removeItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    clearState();
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });
}); 