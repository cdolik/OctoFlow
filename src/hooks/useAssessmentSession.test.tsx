<<<<<<< HEAD
import { renderHook, act } from '@testing-library/react';
=======
import { renderHook } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
>>>>>>> ba2da21 (update test for hooks)
import { useAssessmentSession } from './useAssessmentSession';
import { useStorage } from './useStorage';
import { useError } from '../contexts/ErrorContext';
import { trackAssessmentComplete } from '../utils/analytics';
import { Stage, AssessmentState } from '../types';
import { createMockState } from '../utils/testUtils';

// Mock dependencies
jest.mock('./useStorage');
jest.mock('../contexts/ErrorContext');
jest.mock('../utils/analytics');

describe('useAssessmentSession', () => {
  const mockSaveState = jest.fn();
  const mockHandleError = jest.fn();

  beforeEach(() => {
    (useStorage as jest.Mock).mockReturnValue({
      state: null,
      saveState: mockSaveState,
      isLoading: false,
      error: null
    });

    (useError as jest.Mock).mockReturnValue({
      handleError: mockHandleError
    });

    mockSaveState.mockReset();
    mockHandleError.mockReset();
  });

  it('initializes with correct state', () => {
    const { result } = renderHook(() => useAssessmentSession());

    expect(result.current.state).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.saveStatus).toEqual({ status: 'idle' });
  });

  it('saves response successfully', async () => {
    const mockState = createMockState({
      currentStage: 'pre-seed',
      responses: {}
    });

    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: mockSaveState.mockResolvedValue(true),
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useAssessmentSession());

<<<<<<< HEAD
    await act(async () => {
      const success = await result.current.saveResponse(1, 3, 100);
      expect(success).toBe(true);
    });
=======
    const success = await result.current.restoreSession();
    expect(success).toBe(true);
>>>>>>> ba2da21 (update test for hooks)

    expect(mockSaveState).toHaveBeenCalledWith(expect.objectContaining({
      responses: { '1': 3 }
    }));
    expect(result.current.saveStatus.status).toBe('saved');
  });

<<<<<<< HEAD
  it('handles save response failure', async () => {
    const mockState = createMockState({
      currentStage: 'pre-seed',
      responses: {}
    });
=======
  it('handles session clearing', async () => {
    const { result } = renderHook(
      () => useAssessmentSession(),
      { wrapper }
    );

    result.current.clearSession();
>>>>>>> ba2da21 (update test for hooks)

    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: mockSaveState.mockResolvedValue(false),
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useAssessmentSession());

<<<<<<< HEAD
    await act(async () => {
      const success = await result.current.saveResponse(1, 3, 100);
      expect(success).toBe(false);
    });
=======
    const success = await result.current.restoreSession();
    expect(success).toBe(false);
>>>>>>> ba2da21 (update test for hooks)

    expect(result.current.saveStatus.status).toBe('error');
  });

  it('completes session successfully', async () => {
    const mockState = createMockState({
      currentStage: 'pre-seed',
      responses: { 'question-1': 3 }
    });

    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: mockSaveState.mockResolvedValue(true),
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useAssessmentSession());

    await act(async () => {
      const success = await result.current.completeSession();
      expect(success).toBe(true);
    });

    expect(mockSaveState).toHaveBeenCalledWith(expect.objectContaining({
      progress: { isComplete: true }
    }));
    expect(trackAssessmentComplete).toHaveBeenCalled();
  });

  it('handles complete session failure', async () => {
    const mockState = createMockState({
      currentStage: 'pre-seed',
      responses: {}
    });

    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: mockSaveState.mockResolvedValue(false),
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useAssessmentSession());

    await act(async () => {
      const success = await result.current.completeSession();
      expect(success).toBe(false);
    });

    expect(mockHandleError).toHaveBeenCalled();
  });
});
