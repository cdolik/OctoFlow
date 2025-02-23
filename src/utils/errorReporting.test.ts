import errorReporter from './errorReporting';
import { trackError } from './analytics';

jest.mock('./analytics');

describe('ErrorReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorReporter['errors'].clear();
    errorReporter['errorCallbacks'].clear();
  });

  afterEach(() => {
    errorReporter.dispose();
  });

  it('reports and tracks errors with context', () => {
    const error = new Error('Test error');
    const context = {
      stage: 'pre-seed' as const,
      timestamp: Date.now()
    };

    const errorId = errorReporter.reportError(error, context);
    
    expect(errorId).toBeDefined();
    expect(trackError).toHaveBeenCalledWith('error_reported', expect.objectContaining({
      errorId,
      message: error.message,
      stage: context.stage
    }));
  });

  it('manages error lifecycle correctly', () => {
    const error = new Error('Test error');
    const errorId = errorReporter.reportError(error);

    // Get initial state
    let report = errorReporter.getError(errorId);
    expect(report?.resolved).toBe(false);
    expect(report?.recoveryAttempts).toBe(0);

    // Increment recovery attempts
    errorReporter.incrementRecoveryAttempt(errorId);
    report = errorReporter.getError(errorId);
    expect(report?.recoveryAttempts).toBe(1);

    // Mark as resolved
    errorReporter.markErrorResolved(errorId);
    report = errorReporter.getError(errorId);
    expect(report?.resolved).toBe(true);
  });

  it('notifies subscribers of error updates', () => {
    const callback = jest.fn();
    const unsubscribe = errorReporter.subscribeToErrors(callback);

    const error = new Error('Test error');
    const errorId = errorReporter.reportError(error);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      id: errorId,
      error,
      resolved: false
    }));

    errorReporter.markErrorResolved(errorId);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      id: errorId,
      resolved: true
    }));

    unsubscribe();
  });

  it('filters errors by stage', () => {
    const error1 = new Error('Pre-seed error');
    const error2 = new Error('Seed error');

    errorReporter.reportError(error1, { stage: 'pre-seed' });
    errorReporter.reportError(error2, { stage: 'seed' });

    const preSeedErrors = errorReporter.getErrorsForStage('pre-seed');
    expect(preSeedErrors).toHaveLength(1);
    expect(preSeedErrors[0].error).toBe(error1);

    const seedErrors = errorReporter.getErrorsForStage('seed');
    expect(seedErrors).toHaveLength(1);
    expect(seedErrors[0].error).toBe(error2);
  });

  it('handles unhandled promise rejections', () => {
    const error = new Error('Unhandled rejection');
    const event = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject(error),
      reason: error
    });

    window.dispatchEvent(event);

    const activeErrors = errorReporter.getActiveErrors();
    expect(activeErrors).toHaveLength(1);
    expect(activeErrors[0].error.message).toBe('Unhandled rejection');
  });

  it('cleans up resolved errors', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    const id1 = errorReporter.reportError(error1);
    const id2 = errorReporter.reportError(error2);

    errorReporter.markErrorResolved(id1);
    errorReporter.clearResolvedErrors();

    expect(errorReporter.getError(id1)).toBeUndefined();
    expect(errorReporter.getError(id2)).toBeDefined();
  });

  it('maintains singleton instance', () => {
    const instance1 = errorReporter;
    const instance2 = errorReporter;
    expect(instance1).toBe(instance2);
  });

  it('sorts errors by timestamp', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    jest.useFakeTimers();
    const id1 = errorReporter.reportError(error1);
    
    jest.advanceTimersByTime(1000);
    const id2 = errorReporter.reportError(error2);

    const activeErrors = errorReporter.getActiveErrors();
    expect(activeErrors[0].id).toBe(id2);
    expect(activeErrors[1].id).toBe(id1);

    jest.useRealTimers();
  });
});