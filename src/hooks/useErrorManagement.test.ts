import { renderHook } from '@testing-library/react';
import { useErrorManagement } from './useErrorManagement';
import { useStorage } from './useStorage';
import { useStorageErrorHandler } from './useStorageErrorHandler';
import errorReporter from '../utils/errorReporting';
import { trackError, trackErrorWithRecovery } from '../utils/analytics';
import { ValidationFailedError, StorageFailedError } from '../utils/errorHandling';

jest.mock('./useStorage');
jest.mock('./useStorageErrorHandler');
jest.mock('../utils/errorReporting');
jest.mock('../utils/analytics');

describe('useErrorManagement', () => {
  const mockState = {
    currentStage: 'pre-seed' as const,
    responses: { q1: 3 },
    metadata: {
      lastSaved: new Date().toISOString()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true)
    });
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      handleStorageError: jest.fn().mockResolvedValue(true),
      isRecovering: false,
      retryCount: 0
    });
    (errorReporter.reportError as jest.Mock).mockReturnValue('error-1');
    (errorReporter.getActiveErrors as jest.Mock).mockReturnValue([]);
    (errorReporter.subscribeToErrors as jest.Mock).mockReturnValue(jest.fn());
  });

  it('initializes with empty error state', () => {
    const { result } = renderHook(() => useErrorManagement());

    expect(result.current.error).toBeNull();
    expect(result.current.isRecovering).toBe(false);
    expect(result.current.hasCriticalError).toBe(false);
  });

  it('handles recoverable errors', async () => {
    const { result } = renderHook(() => useErrorManagement());
    const mockRecover = jest.fn().mockResolvedValue(true);
    const validationError = new ValidationFailedError('field', 'constraint', 'test error');

    const recovered = await result.current.handleError(validationError, mockRecover);
    expect(recovered).toBe(true);

    expect(result.current.isRecovering).toBe(false);
    expect(mockRecover).toHaveBeenCalled();
    expect(trackErrorWithRecovery).toHaveBeenCalledWith(
      validationError,
      true,
      true
    );
  });

  it('handles non-recoverable errors', async () => {
    const { result } = renderHook(() => useErrorManagement());
    const storageError = new StorageFailedError('write');

    const recovered = await result.current.handleError(storageError);
    expect(recovered).toBe(false);

    expect(result.current.error).toBe(storageError);
    expect(result.current.isRecovering).toBe(false);
    expect(trackErrorWithRecovery).toHaveBeenCalledWith(
      storageError,
      false,
      false
    );
  });

  it('tracks recovery attempts', async () => {
    const { result } = renderHook(() => useErrorManagement());
    const mockRecover = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    const error = new ValidationFailedError('field', 'constraint', 'test error');

    const recoveryPromise = result.current.handleError(error, mockRecover);
    expect(result.current.isRecovering).toBe(true);
    await recoveryPromise;

    expect(result.current.isRecovering).toBe(false);
  });

  it('handles failed recovery attempts', async () => {
    const { result } = renderHook(() => useErrorManagement());
    const mockRecover = jest.fn().mockRejectedValue(new Error('Recovery failed'));
    const error = new ValidationFailedError('field', 'constraint', 'test error');

    const recovered = await result.current.handleError(error, mockRecover);
    expect(recovered).toBe(false);

    expect(result.current.error).toBe(error);
    expect(result.current.isRecovering).toBe(false);
    expect(trackErrorWithRecovery).toHaveBeenCalledWith(
      error,
      true,
      false
    );
  });

  it('clears error state', async () => {
    const { result } = renderHook(() => useErrorManagement());
    const error = new ValidationFailedError('field', 'constraint', 'test error');

    await result.current.handleError(error);

    expect(result.current.error).toBe(error);

    result.current.clearError();

    expect(result.current.error).toBeNull();
    expect(result.current.isRecovering).toBe(false);
    expect(result.current.hasCriticalError).toBe(false);
  });

  it('identifies critical errors correctly', async () => {
    const { result } = renderHook(() => useErrorManagement());
    const criticalError = new StorageFailedError('write');
    criticalError.severity = 'critical';

    await result.current.handleError(criticalError);

    expect(result.current.hasCriticalError).toBe(true);
  });

  it('handles and reports errors with context', async () => {
    const { result } = renderHook(() => useErrorManagement({
      stage: 'pre-seed'
    }));

    const error = new Error('Test error');
    await act(async () => {
      await result.current.handleError(error);
    });

    expect(errorReporter.reportError).toHaveBeenCalledWith(error, {
      stage: 'pre-seed',
      responses: mockState.responses,
      metadata: mockState.metadata
    });
    expect(trackError).toHaveBeenCalledWith('error_handled', expect.any(Object));
  });

  it('attempts recovery for storage errors', async () => {
    const { result } = renderHook(() => useErrorManagement());

    const storageError = new Error('storage error');
    await act(async () => {
      await result.current.handleError(storageError);
    });

    const errorHandler = (useStorageErrorHandler as jest.Mock).mock.results[0].value;
    expect(errorHandler.handleStorageError).toHaveBeenCalledWith(storageError);
  });

  it('calls onUnrecoverableError when recovery fails', async () => {
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      handleStorageError: jest.fn().mockResolvedValue(false),
      isRecovering: false,
      retryCount: 3
    });

    const onUnrecoverableError = jest.fn();
    const { result } = renderHook(() => useErrorManagement({
      onUnrecoverableError
    }));

    const storageError = new Error('storage error');
    await act(async () => {
      await result.current.handleError(storageError);
    });

    expect(onUnrecoverableError).toHaveBeenCalledWith(storageError);
  });

  it('clears errors and attempts state save', async () => {
    (errorReporter.getError as jest.Mock).mockReturnValue({
      error: new Error('storage error'),
      resolved: false
    });

    const { result } = renderHook(() => useErrorManagement());

    await act(async () => {
      await result.current.clearError('error-1');
    });

    expect(errorReporter.markErrorResolved).toHaveBeenCalledWith('error-1');
    const storage = (useStorage as jest.Mock).mock.results[0].value;
    expect(storage.saveState).toHaveBeenCalledWith(mockState);
  });

  it('tracks failed error resolutions', async () => {
    (errorReporter.getError as jest.Mock).mockReturnValue({
      error: new Error('storage error'),
      resolved: false
    });
    const saveError = new Error('Save failed');
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockRejectedValue(saveError)
    });

    const { result } = renderHook(() => useErrorManagement());

    await act(async () => {
      await result.current.clearError('error-1');
    });

    expect(trackError).toHaveBeenCalledWith('error_resolution_failed', expect.objectContaining({
      originalErrorId: 'error-1',
      error: saveError.message
    }));
  });

  it('filters errors by stage', async () => {
    const mockStageErrors = [
      { id: 'error-1', stage: 'pre-seed' },
      { id: 'error-2', stage: 'pre-seed' }
    ];
    (errorReporter.getErrorsForStage as jest.Mock).mockReturnValue(mockStageErrors);

    const { result } = renderHook(() => useErrorManagement({
      stage: 'pre-seed'
    }));

    const errors = result.current.getActiveErrors();
    expect(errors).toEqual(mockStageErrors);
    expect(errorReporter.getErrorsForStage).toHaveBeenCalledWith('pre-seed');
  });

  it('updates active error count on subscription', async () => {
    let subscriptionCallback: Function;
    (errorReporter.subscribeToErrors as jest.Mock).mockImplementation(callback => {
      subscriptionCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useErrorManagement());
    expect(result.current.activeErrorCount).toBe(0);

    (errorReporter.getActiveErrors as jest.Mock).mockReturnValue([
      { id: 'error-1' },
      { id: 'error-2' }
    ]);

    act(() => {
      subscriptionCallback();
    });

    expect(result.current.activeErrorCount).toBe(2);
  });

  it('tracks error handling states', async () => {
    const { result } = renderHook(() => useErrorManagement());

    expect(result.current.isHandlingError).toBe(false);

    await act(async () => {
      const promise = result.current.handleError(new Error('Test error'));
      expect(result.current.isHandlingError).toBe(true);
      await promise;
    });

    expect(result.current.isHandlingError).toBe(false);
  });
});