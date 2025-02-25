import { expect } from '@jest/globals';

interface CustomMatchers<R = unknown> {
  toHaveBeenCalledOnceWith(...args: any[]): R;
  toBeWithinRange(floor: number, ceiling: number): R;
  toHavePerformanceMetrics(expected: { name: string; duration: number }): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  toHaveBeenCalledOnceWith(received: jest.Mock, ...expectedArgs: any[]) {
    const pass = received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(expectedArgs);

    return {
      pass,
      message: () => pass
        ? `Expected ${received.getMockName()} not to have been called once with ${expectedArgs}`
        : `Expected ${received.getMockName()} to have been called once with ${expectedArgs}`
    };
  },

  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to be within range ${floor} - ${ceiling}`
        : `Expected ${received} to be within range ${floor} - ${ceiling}`
    };
  },

  toHavePerformanceMetrics(received: any, expected: { name: string; duration: number }) {
    const { name, duration } = expected;
    const pass = received?.name === name && 
      typeof received?.duration === 'number' && 
      received.duration >= duration;

    return {
      pass,
      message: () => pass
        ? `Expected performance metrics not to match ${JSON.stringify(expected)}`
        : `Expected performance metrics to match ${JSON.stringify(expected)}`
    };
  }
});