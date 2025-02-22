import { renderHook, act } from '@testing-library/react';
import { useStageValidation } from './useStageValidation';
import { validateStageProgression, validateStageTransition } from '../utils/stageValidation';
import { trackError } from '../utils/analytics';
import { Stage } from '../types';

jest.mock('../utils/stageValidation');
jest.mock('../utils/analytics');

describe('useStageValidation', () => {
  const mockResponses = {
    'question-1': 3,
    'question-2': 4
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (validateStageProgression as jest.Mock).mockReturnValue({ isValid: true });
    (validateStageTransition as jest.Mock).mockReturnValue({ isValid: true });
  });

  it('validates stage progression correctly', async () => {
    const { result } = renderHook(() => useStageValidation({
      currentStage: 'pre-seed',
      targetStage: 'seed',
      responses: mockResponses
    }));

    await act(async () => {
      await result.current.revalidate();
    });

    expect(validateStageProgression).toHaveBeenCalledWith('pre-seed', 'seed');
    expect(result.current.canProgress).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles invalid stage progression', async () => {
    const mockError = 'Cannot skip stages';
    (validateStageProgression as jest.Mock).mockReturnValue({ 
      isValid: false, 
      error: mockError 
    });

    const onValidationError = jest.fn();

    const { result } = renderHook(() => useStageValidation({
      currentStage: 'pre-seed',
      targetStage: 'series-a',
      responses: mockResponses,
      onValidationError
    }));

    await act(async () => {
      await result.current.revalidate();
    });

    expect(result.current.canProgress).toBe(false);
    expect(result.current.error).toBe(mockError);
    expect(onValidationError).toHaveBeenCalledWith(mockError);
    expect(trackError).toHaveBeenCalledWith(
      'stage_validation_error',
      expect.objectContaining({ error: mockError })
    );
  });

  it('validates stage transition when current stage exists', async () => {
    const { result } = renderHook(() => useStageValidation({
      currentStage: 'seed',
      targetStage: 'series-a',
      responses: mockResponses
    }));

    await act(async () => {
      await result.current.revalidate();
    });

    expect(validateStageTransition).toHaveBeenCalledWith(
      'seed',
      'series-a',
      expect.any(Array),
      mockResponses
    );
  });

  it('skips transition validation for initial stage', async () => {
    const { result } = renderHook(() => useStageValidation({
      currentStage: null,
      targetStage: 'pre-seed',
      responses: {}
    }));

    await act(async () => {
      await result.current.revalidate();
    });

    expect(validateStageTransition).not.toHaveBeenCalled();
    expect(result.current.canProgress).toBe(true);
  });

  it('updates validation state when target stage changes', async () => {
    const { result, rerender } = renderHook(
      (props: { targetStage: Stage }) => useStageValidation({
        currentStage: 'pre-seed',
        targetStage: props.targetStage,
        responses: mockResponses
      }), 
      { initialProps: { targetStage: 'seed' } }
    );

    expect(result.current.isValidating).toBe(false);

    rerender({ targetStage: 'series-a' });

    expect(validateStageProgression).toHaveBeenCalledWith('pre-seed', 'series-a');
  });

  it('revalidates on demand', async () => {
    const { result } = renderHook(() => useStageValidation({
      currentStage: 'pre-seed',
      targetStage: 'seed',
      responses: mockResponses
    }));

    await act(async () => {
      const isValid = await result.current.revalidate();
      expect(isValid).toBe(true);
    });

    expect(validateStageProgression).toHaveBeenCalledTimes(2); // Initial + revalidate
  });
});