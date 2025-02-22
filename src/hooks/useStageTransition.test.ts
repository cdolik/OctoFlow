import { renderHook, act } from '@testing-library/react';
import { useStageTransition } from './useStageTransition';
import { validateStageProgression } from '../utils/flowState';
import { saveAssessmentResponses } from '../utils/storage';
import { trackStageTransition } from '../utils/analytics';

jest.mock('../utils/flowState');
jest.mock('../utils/storage');
jest.mock('../utils/analytics');
jest.useFakeTimers();

describe('useStageTransition', () => {
  const mockProps = {
    currentStage: 'pre-seed' as const,
    responses: { q1: 3, q2: 4 },
    onTransitionComplete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (validateStageProgression as jest.Mock).mockReturnValue(true);
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useStageTransition(mockProps));
    
    expect(result.current).toEqual(expect.objectContaining({
      isTransitioning: false,
      progress: 0
    }));
  });

  it('handles valid stage transition', () => {
    const { result } = renderHook(() => useStageTransition(mockProps));

    act(() => {
      result.current.startTransition('seed');
    });

    expect(result.current.isTransitioning).toBe(true);
    expect(result.current.fromStage).toBe('pre-seed');
    expect(result.current.toStage).toBe('seed');
    expect(saveAssessmentResponses).toHaveBeenCalledWith(mockProps.responses);
    expect(trackStageTransition).toHaveBeenCalledWith('pre-seed', 'seed');
  });

  it('prevents invalid stage transitions', () => {
    (validateStageProgression as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useStageTransition(mockProps));

    act(() => {
      const success = result.current.startTransition('series-a');
      expect(success).toBe(false);
    });

    expect(result.current.isTransitioning).toBe(false);
    expect(saveAssessmentResponses).not.toHaveBeenCalled();
  });

  it('progresses transition and calls completion callback', () => {
    const { result } = renderHook(() => useStageTransition(mockProps));

    act(() => {
      result.current.startTransition('seed');
    });

    act(() => {
      jest.advanceTimersByTime(1000); // Advance past transition duration
    });

    expect(mockProps.onTransitionComplete).toHaveBeenCalledWith('seed');
    expect(result.current.isTransitioning).toBe(false);
  });

  it('allows canceling transition with Escape key', () => {
    const { result } = renderHook(() => useStageTransition(mockProps));

    act(() => {
      result.current.startTransition('seed');
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isTransitioning).toBe(false);
    expect(mockProps.onTransitionComplete).not.toHaveBeenCalled();
  });

  it('cleans up timer on unmount during transition', () => {
    const { result, unmount } = renderHook(() => useStageTransition(mockProps));

    act(() => {
      result.current.startTransition('seed');
    });

    unmount();

    expect(mockProps.onTransitionComplete).not.toHaveBeenCalled();
  });
});