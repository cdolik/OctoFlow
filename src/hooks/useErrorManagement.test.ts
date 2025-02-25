import { renderHook } from '@testing-library/react';
import { useErrorManagement } from './useErrorManagement';
import { ValidationFailedError, StorageFailedError } from '../utils/errorHandling';
import { trackErrorWithRecovery } from '../utils/analytics';

jest.mock('../utils/analytics');

describe('useErrorManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
