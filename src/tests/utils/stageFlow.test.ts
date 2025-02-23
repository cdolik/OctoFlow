import { getStageConfig, validateStageSequence, getNextStage, getPreviousStage } from '../../data/StageConfig';
import { filterQuestionsByStage, validateQuestionResponses, calculateStageProgress } from '../../utils/questionFiltering';
import { Stage, Question } from '../../types';

const mockQuestions: Question[] = [
  {
    id: 'branch-strategy',
    text: 'Branch Protection Strategy',
    category: 'workflow',
    weight: 1,
    stages: ['pre-seed', 'seed'],
    options: [
      { value: 1, text: 'No protection' },
      { value: 2, text: 'Basic protection' }
    ]
  },
  {
    id: 'security-scanning',
    text: 'Security Scanning',
    category: 'security',
    weight: 2,
    stages: ['seed', 'series-a'],
    options: [
      { value: 1, text: 'No scanning' },
      { value: 2, text: 'Basic scanning' }
    ]
  }
];

describe('Stage Configuration', () => {
  it('validates stage sequence correctly', () => {
    expect(validateStageSequence(null, 'pre-seed')).toBe(true);
    expect(validateStageSequence('pre-seed', 'seed')).toBe(true);
    expect(validateStageSequence('pre-seed', 'series-a')).toBe(false);
  });

  it('gets next stage correctly', () => {
    expect(getNextStage('pre-seed')).toBe('seed');
    expect(getNextStage('series-b')).toBeNull();
  });

  it('gets previous stage correctly', () => {
    expect(getPreviousStage('seed')).toBe('pre-seed');
    expect(getPreviousStage('pre-seed')).toBeNull();
  });

  it('retrieves stage configuration', () => {
    const config = getStageConfig('pre-seed');
    expect(config.focus).toContain('workflow');
    expect(config.benchmarks.securityLevel).toBe(1);
  });

  it('throws on invalid stage', () => {
    expect(() => getStageConfig('invalid' as Stage)).toThrow('Invalid stage');
  });
});

describe('Question Filtering', () => {
  it('filters questions by stage correctly', () => {
    const preSeedQuestions = filterQuestionsByStage(mockQuestions, 'pre-seed');
    expect(preSeedQuestions).toHaveLength(1);
    expect(preSeedQuestions[0].id).toBe('branch-strategy');

    const seedQuestions = filterQuestionsByStage(mockQuestions, 'seed');
    expect(seedQuestions).toHaveLength(2);
  });

  it('validates question responses', () => {
    const validResponses = {
      'branch-strategy': 2
    };

    const invalidResponses = {
      'branch-strategy': 5, // Invalid value
      'invalid-question': 1 // Non-existent question
    };

    const validResult = validateQuestionResponses(validResponses, mockQuestions, 'pre-seed');
    expect(validResult.isValid).toBe(true);

    const invalidResult = validateQuestionResponses(invalidResponses, mockQuestions, 'pre-seed');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.details).toContain('branch-strategy');
  });

  it('calculates stage progress correctly', () => {
    const responses = {
      'branch-strategy': 2
    };

    const progress = calculateStageProgress(responses, mockQuestions, 'pre-seed');
    expect(progress).toBe(1); // 1 of 1 questions answered

    const seedProgress = calculateStageProgress(responses, mockQuestions, 'seed');
    expect(seedProgress).toBe(0.5); // 1 of 2 questions answered
  });

  it('filters with additional options', () => {
    const securityQuestions = filterQuestionsByStage(mockQuestions, 'seed', {
      requireCategory: 'security'
    });
    expect(securityQuestions).toHaveLength(1);
    expect(securityQuestions[0].id).toBe('security-scanning');

    const excludedQuestions = filterQuestionsByStage(mockQuestions, 'seed', {
      excludeCategories: ['security']
    });
    expect(excludedQuestions).toHaveLength(1);
    expect(excludedQuestions[0].id).toBe('branch-strategy');
  });
});