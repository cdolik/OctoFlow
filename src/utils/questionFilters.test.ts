import { getStageQuestions, validateQuestionFilter, validateStageResponses } from './questionFilters';
import { Question, Stage } from '../types';

describe('Question Filtering', () => {
  const mockQuestions: Question[] = [
    {
      id: 'basic-automation',
      text: 'Do you use GitHub Actions?',
      category: 'automation',
      weight: 1,
      stages: ['pre-seed', 'seed', 'series-a'],
      options: [
        { value: 1, text: 'No' },
        { value: 2, text: 'Planning to' },
        { value: 3, text: 'Basic workflows' },
        { value: 4, text: 'Advanced workflows' }
      ]
    },
    {
      id: 'ai-adoption',
      text: 'How extensively do you use GitHub Copilot?',
      category: 'ai-adoption',
      weight: 3,
      stages: ['seed', 'series-a'],
      options: [
        { value: 1, text: 'Not using' },
        { value: 2, text: 'Limited usage' },
        { value: 3, text: 'Team-wide adoption' },
        { value: 4, text: 'Advanced integration' }
      ]
    }
  ];

  describe('getStageQuestions', () => {
    it('returns correct questions for pre-seed stage', () => {
      const result = getStageQuestions('pre-seed', mockQuestions);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('basic-automation');
    });

    it('returns correct questions for seed stage', () => {
      const result = getStageQuestions('seed', mockQuestions);
      expect(result).toHaveLength(2);
    });

    it('handles invalid stage gracefully', () => {
      const result = getStageQuestions('invalid-stage' as Stage, mockQuestions);
      expect(result).toHaveLength(0);
    });
  });

  describe('validateQuestionFilter', () => {
    it('validates pre-seed questions correctly', () => {
      const basicQuestion = mockQuestions[0];
      const advancedQuestion = mockQuestions[1];
      
      expect(validateQuestionFilter(basicQuestion, 'pre-seed')).toBe(true);
      expect(validateQuestionFilter(advancedQuestion, 'pre-seed')).toBe(false);
    });

    it('validates seed stage questions correctly', () => {
      const basicQuestion = mockQuestions[0];
      const advancedQuestion = mockQuestions[1];
      
      expect(validateQuestionFilter(basicQuestion, 'seed')).toBe(true);
      expect(validateQuestionFilter(advancedQuestion, 'seed')).toBe(true);
    });
  });

  describe('validateStageResponses', () => {
    it('validates complete responses correctly', () => {
      const responses = {
        'basic-automation': 3
      };

      const result = validateStageResponses(responses, mockQuestions, 'pre-seed');
      expect(result.isValid).toBe(true);
    });

    it('detects invalid question responses', () => {
      const responses = {
        'ai-adoption': 3  // This question isn't available in pre-seed
      };

      const result = validateStageResponses(responses, mockQuestions, 'pre-seed');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Responses found for questions not in current stage');
    });

    it('handles invalid response format', () => {
      const result = validateStageResponses(null as any, mockQuestions, 'pre-seed');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid responses format');
    });
  });
});