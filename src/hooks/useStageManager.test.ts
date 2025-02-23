import { renderHook, act } from '@testing-library/react';
import { useStageManager } from './useStageManager';
import { useStorage } from './useStorage';
import { useStorageErrorHandler } from './useStorageErrorHandler';
import { useStageValidation } from './useStageValidation';
import { getStageConfig } from '../data/StageConfig';
import { trackError } from '../utils/analytics';

jest.mock('./useStorage');
jest.mock('./useStorageErrorHandler');
jest.mock('./useStageValidation');
jest.mock('../data/StageConfig');
jest.mock('../utils/analytics');

describe('useStageManager', () => {
  const mockState = {
    currentStage: 'pre-seed' as const,
    responses: { q1: 3 },
    metadata: {
      lastSaved: new Date().toISOString(),
      questionCount: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      isLoading: false
    });
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      isRecovering: false,
      handleStorageError: jest.fn().mockResolvedValue(true)
    });
    (useStageValidation as jest.Mock).mockReturnValue({
      error: null
    });
    (getStageConfig as jest.Mock).mockReturnValue({
      id: 'seed',
      label: 'Seed Stage'
    });
  });

  it('handles stage transitions successfully', async () => {
    const onStageComplete = jest.fn();
    const { result } = renderHook(() => useStageManager({ onStageComplete }));

    await act(async () => {
      await result.current.transition('seed');
    });

    const storage = (useStorage as jest.Mock).mock.results[0].value;
    expect(storage.saveState).toHaveBeenCalledWith(expect.objectContaining({
      currentStage: 'seed',
      metadata: expect.objectContaining({
        lastTransition: expect.any(String),
        stageStartTime: expect.any(Number)
      })
    }));
    expect(onStageComplete).toHaveBeenCalledWith('seed');
  });

  it('handles storage errors during transition', async () => {
    const storageError = new Error('storage error');
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockRejectedValue(storageError),
      isLoading: false
    });

    const onStageError = jest.fn();
    const { result } = renderHook(() => useStageManager({ onStageError }));

    await act(async () => {
      await result.current.transition('seed');
    });

    const errorHandler = (useStorageErrorHandler as jest.Mock).mock.results[0].value;
    expect(errorHandler.handleStorageError).toHaveBeenCalledWith(storageError);
    expect(onStageError).toHaveBeenCalled();
    expect(trackError).toHaveBeenCalledWith('stage_transition_error', expect.any(Object));
  });

  it('handles validation errors', async () => {
    const validationError = new Error('Invalid stage transition');
    (useStageValidation as jest.Mock).mockReturnValue({
      error: validationError
    });

    const { result } = renderHook(() => useStageManager());
    expect(result.current.error).toBe(validationError);
  });

  it('tracks loading states correctly', async () => {
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(true),
      isLoading: true
    });
    (useStorageErrorHandler as jest.Mock).mockReturnValue({
      isRecovering: true,
      handleStorageError: jest.fn()
    });

    const { result } = renderHook(() => useStageManager());
    expect(result.current.isLoading).toBe(true);
  });

  it('preserves existing responses during transition', async () => {
    const { result } = renderHook(() => useStageManager());

    await act(async () => {
      await result.current.transition('seed');
    });

    const storage = (useStorage as jest.Mock).mock.results[0].value;
    expect(storage.saveState).toHaveBeenCalledWith(expect.objectContaining({
      responses: mockState.responses
    }));
  });

  it('handles failed transitions gracefully', async () => {
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: jest.fn().mockResolvedValue(false),
      isLoading: false
    });

    const { result } = renderHook(() => useStageManager());

    await act(async () => {
      await result.current.transition('seed');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.currentStage).toBe('pre-seed');
  });
});