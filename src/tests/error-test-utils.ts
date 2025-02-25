import { waitFor } from '@testing-library/react';
import type { AssessmentError, ErrorContext } from '../types/errors';

export class TestError extends Error implements AssessmentError {
  constructor(
    message: string,
    public severity: 'low' | 'medium' | 'high' = 'medium',
    public recoverable: boolean = true,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'TestError';
  }
}

export const waitForError = async (
  action: () => Promise<any> | void,
  expectedError?: string | RegExp
) => {
  let caught: Error | undefined;
  try {
    await action();
  } catch (e) {
    caught = e as Error;
  }

  await waitFor(() => {
    expect(caught).toBeDefined();
    if (expectedError) {
      expect(caught?.message).toMatch(expectedError);
    }
  });

  return caught!;
};

export const createAsyncError = (message: string, delay = 100): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TestError(message));
    }, delay);
  });
};

export const withErrorBoundary = async (fn: () => Promise<void> | void) => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await fn();
  } finally {
    consoleError.mockRestore();
  }
};