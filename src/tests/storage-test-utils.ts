import type { StorageState } from '../types/storage';

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

export const mockLocalStorage = new MockStorage();

export function setupStorageTests() {
  const originalLocalStorage = window.localStorage;
  
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  });
}

export function mockStorageState(state: Partial<StorageState>) {
  mockLocalStorage.setItem('state', JSON.stringify({
    version: '1.0',
    currentStage: 'pre-seed',
    responses: {},
    metadata: {
      lastSaved: new Date().toISOString(),
      timeSpent: 0,
      attemptCount: 1
    },
    progress: {
      questionIndex: 0,
      totalQuestions: 10,
      isComplete: false
    },
    ...state
  }));
}

export function clearStorageMocks() {
  mockLocalStorage.clear();
}

export async function waitForStorage(key: string): Promise<any> {
  return new Promise(resolve => {
    const value = mockLocalStorage.getItem(key);
    if (value) {
      resolve(JSON.parse(value));
    }
    const interval = setInterval(() => {
      const newValue = mockLocalStorage.getItem(key);
      if (newValue) {
        clearInterval(interval);
        resolve(JSON.parse(newValue));
      }
    }, 100);
  });
}