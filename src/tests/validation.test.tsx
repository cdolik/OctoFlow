import { renderHook } from '@testing-library/react';
import { useStageValidation } from '../hooks/useStageValidation';
import { validateQuestionResponses } from '../utils/questionFiltering';
import { validateStageSequence } from '../data/StageConfig';
import { Stage, Question } from '../types';
import { trackError } from '../utils/analytics';

jest.mock('../utils/analytics');

describe('Validation System', () => {
  const mockQuestions: Question[] = [
    {
      id: 'branch-strategy',
      text: 'Branch strategy',
      category: 'github-ecosystem',
      weight: 1,
      stages: ['pre-seed', 'seed'],
      options: [
        { value: 1, text: 'Option 1' },
        { value: 2, text: 'Option 2' }
      ]
    },
    {
      id: 'security-scan',
      text: 'Security scanning',
      category: 'security',
      weight: 1,
      stages: ['seed', 'series-a'],
      options: [
        { value: 1, text: 'Option 1' },
        { value: 2, text: 'Option 2' }
      ]
    }
  ];

  describe('Stage Validation Hook', () => {
    it('handles invalid stage transitions', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useStageValidation({
        currentStage: 'pre-seed',
        targetStage: 'series-a',
        responses: {},
        onValidationError: onError
      }));

      expect(result.current.error).toBeTruthy();
      expect(onError).toHaveBeenCalled();
      expect(trackError).toHaveBeenCalled();
    });

    it('validates required responses', async () => {
      const { result } = renderHook(() => useStageValidation({
        currentStage: 'pre-seed',
        targetStage: 'seed',
        responses: {
          'branch-strategy': 3
        }
      }));

      expect(result.current.canProgress).toBe(true);
    });

    it('prevents invalid response values', async () => {
      const { result } = renderHook(() => useStageValidation({
        currentStage: 'pre-seed',
        targetStage: 'seed',
        responses: {
          'branch-strategy': 5 // Invalid score
        }
      }));

      expect(result.current.canProgress).toBe(false);
      expect(result.current.error).toContain('Invalid score');
    });
  });

  describe('Question Response Validation', () => {
    it('validates response completeness', () => {
      const incompleteResponses: Record<string, number> = {
        'branch-strategy': 3
        // Missing security-scan response
      };

      const result = validateQuestionResponses(
        incompleteResponses,
        mockQuestions,
        'seed'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing required questions');
    });

    it('handles malformed responses', () => {
      const result = validateQuestionResponses(
        null,
        mockQuestions,
        'pre-seed'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid responses format');
    });

    it('prevents out-of-stage responses', () => {
      const invalidResponses = {
        'security-scan': 3 // Not available in pre-seed stage
      };

      const result = validateQuestionResponses(
        invalidResponses,
        mockQuestions,
        'pre-seed'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Responses found for questions not in current stage');
    });
  });

  describe('Stage Sequence Validation', () => {
    const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];

    it('prevents skipping stages', () => {
      stages.forEach((stage, index) => {
        if (index < stages.length - 2) {
          const skipResult = validateStageSequence(stage, stages[index + 2]);
          expect(skipResult).toBe(false);
        }
      });
    });

    it('allows backwards navigation', () => {
      stages.forEach((stage, index) => {
        if (index > 0) {
          const backResult = validateStageSequence(stage, stages[index - 1]);
          expect(backResult).toBe(true);
        }
      });
    });

    it('allows initial stage selection', () => {
      stages.forEach(stage => {
        const initialResult = validateStageSequence(null, stage);
        expect(initialResult).toBe(true);
      });
    });
  });
});