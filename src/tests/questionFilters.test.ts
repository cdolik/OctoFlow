import { validateQuestionFilter, getStageQuestions, validateStageProgress } from '../utils/questionFilters';
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
        { value: 2, text: 'Limited use' },
        { value: 3, text: 'Regular use' },
        { value: 4, text: 'Team-wide adoption' }
      ]
    }
  ];

  describe('validateQuestionFilter', () => {
    it('filters pre-seed questions correctly', () => {
      const automationQuestion = mockQuestions[0];
      const aiQuestion = mockQuestions[1];

      expect(validateQuestionFilter(automationQuestion, 'pre-seed')).toBe(true);
      expect(validateQuestionFilter(aiQuestion, 'pre-seed')).toBe(false);
    });

    it('allows more advanced questions for seed stage', () => {
      mockQuestions.forEach(question => {
        expect(validateQuestionFilter(question, 'seed')).toBe(
          question.weight <= 3
        );
      });
    });

    it('includes all valid questions for series-a', () => {
      mockQuestions.forEach(question => {
        expect(validateQuestionFilter(question, 'series-a')).toBe(
          question.stages.includes('series-a')
        );
      });
    });
  });

  describe('getStageQuestions', () => {
    it('returns correct number of questions per stage', () => {
      const preSeedQuestions = getStageQuestions(mockQuestions, 'pre-seed');
      const seedQuestions = getStageQuestions(mockQuestions, 'seed');
      const seriesAQuestions = getStageQuestions(mockQuestions, 'series-a');

      expect(preSeedQuestions.length).toBe(1);
      expect(seedQuestions.length).toBe(2);
      expect(seriesAQuestions.length).toBe(2);
    });
  });

  describe('validateStageProgress', () => {
    it('validates complete responses correctly', () => {
      const responses = {
        'basic-automation': 3,
        'ai-adoption': 4
      };

      expect(validateStageProgress(responses, mockQuestions, 'series-a')).toBe(true);
    });

    it('fails validation for missing required questions', () => {
      const responses = {
        'basic-automation': 3
      };

      expect(validateStageProgress(responses, mockQuestions, 'seed')).toBe(false);
    });

    it('validates responses within correct range', () => {
      const responses = {
        'basic-automation': 5, // Invalid score
        'ai-adoption': 3
      };

      expect(validateStageProgress(responses, mockQuestions, 'series-a')).toBe(false);
    });
  });
});