import { renderHook, act } from '@testing-library/react';
import { useStateRecovery } from './useStateRecovery';
import { getAssessmentData } from '../utils/storage';
import { validateStageProgress } from '../utils/flowState';

jest.mock('../utils/storage');
jest.mock('../utils/flowState');

describe('useStateRecovery', () => {
  const mockState = {
    currentStage: 'pre-seed' as const,
    responses: { 'question1': 3, 'question2': 4 },
    metadata: {
      lastSaved: Date.now(),
      questionCount: 2
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAssessmentData as jest.Mock).mockReturnValue(mockState);
    (validateStageProgress as jest.Mock).mockReturnValue(true);
  });

  it('attempts recovery automatically on mount', async () => {
    const { result } = renderHook(() => useStateRecovery());

    // Wait for automatic recovery
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.recoveredStage).toBe(mockState.currentStage);
    expect(result.current.recoveredResponses).toEqual(mockState.responses);
    expect(result.current.error).toBeNull();
  });

  it('handles failed validation during recovery', async () => {
    (validateStageProgress as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useStateRecovery());

    await act(async () => {
      const success = await result.current.attemptRecovery();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.recoveredStage).toBeNull();
  });

  it('handles missing state data', async () => {
    (getAssessmentData as jest.Mock).mockReturnValue({});

    const { result } = renderHook(() => useStateRecovery());

    await act(async () => {
      const success = await result.current.attemptRecovery();
      expect(success).toBe(false);
    });

    expect(result.current.recoveredStage).toBeNull();
    expect(result.current.recoveredResponses).toEqual({});
  });

  it('tracks recovery status correctly', async () => {
    const { result } = renderHook(() => useStateRecovery());

    // Start recovery
    let recoveryPromise: Promise<boolean>;
    await act(async () => {
      recoveryPromise = result.current.attemptRecovery();
      expect(result.current.isRecovering).toBe(true);
    });

    // Complete recovery
    await act(async () => {
      await recoveryPromise;
      expect(result.current.isRecovering).toBe(false);
    });
  });

  it('clears recovered state correctly', async () => {
    const { result } = renderHook(() => useStateRecovery());

    // Wait for initial recovery
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.recoveredStage).toBe(mockState.currentStage);

    // Clear state
    act(() => {
      result.current.clearRecoveredState();
    });

    expect(result.current.recoveredStage).toBeNull();
    expect(result.current.recoveredResponses).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('handles storage errors gracefully', async () => {
    (getAssessmentData as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useStateRecovery());

    await act(async () => {
      const success = await result.current.attemptRecovery();
      expect(success).toBe(false);
    });

    expect(result.current.error?.message).toBe('Storage error');
    expect(result.current.recoveredStage).toBeNull();
  });
});