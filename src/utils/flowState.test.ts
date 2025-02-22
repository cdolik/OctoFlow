import { getResumePoint, validateStageProgression, getNextStage, getPreviousStage } from './flowState';
import { getAssessmentResponses, getAssessmentMetadata } from './storage';
import { Stage } from '../types';

jest.mock('./storage');

describe('Flow State Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResumePoint', () => {
    it('returns null stage when no metadata exists', () => {
      (getAssessmentMetadata as jest.Mock).mockReturnValue(null);
      (getAssessmentResponses as jest.Mock).mockReturnValue({});

      const result = getResumePoint();
      expect(result).toEqual({
        stage: null,
        questionIndex: 0,
        completed: false
      });
    });

    it('calculates correct question index and completion status', () => {
      (getAssessmentMetadata as jest.Mock).mockReturnValue({
        stage: 'pre-seed',
        questionCount: 5
      });
      (getAssessmentResponses as jest.Mock).mockReturnValue({
        'q1': 3,
        'q2': 4,
        'q3': 2
      });

      const result = getResumePoint();
      expect(result).toEqual({
        stage: 'pre-seed',
        questionIndex: 3,
        completed: false
      });
    });

    it('identifies completed assessments', () => {
      (getAssessmentMetadata as jest.Mock).mockReturnValue({
        stage: 'seed',
        questionCount: 3
      });
      (getAssessmentResponses as jest.Mock).mockReturnValue({
        'q1': 3,
        'q2': 4,
        'q3': 2
      });

      const result = getResumePoint();
      expect(result.completed).toBe(true);
    });
  });

  describe('validateStageProgression', () => {
    it('allows starting from any stage when no current stage', () => {
      const result = validateStageProgression(null, 'seed');
      expect(result.isValid).toBe(true);
    });

    it('allows progression to next stage', () => {
      expect(validateStageProgression('pre-seed', 'seed').isValid).toBe(true);
      expect(validateStageProgression('seed', 'series-a').isValid).toBe(true);
    });

    it('allows moving to previous stages', () => {
      expect(validateStageProgression('series-a', 'seed').isValid).toBe(true);
      expect(validateStageProgression('series-a', 'pre-seed').isValid).toBe(true);
    });

    it('prevents skipping stages forward', () => {
      expect(validateStageProgression('pre-seed', 'series-a').isValid).toBe(false);
    });

    it('allows staying in current stage', () => {
      expect(validateStageProgression('seed', 'seed').isValid).toBe(true);
    });

    it('handles invalid stage identifiers', () => {
      const result = validateStageProgression('pre-seed', 'invalid' as Stage);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid stage identifier');
    });
  });

  describe('getNextStage', () => {
    it('returns correct next stage', () => {
      expect(getNextStage('pre-seed')).toBe('seed');
      expect(getNextStage('seed')).toBe('series-a');
    });

    it('returns null for final stage', () => {
      expect(getNextStage('series-b')).toBeNull();
    });
  });

  describe('getPreviousStage', () => {
    it('returns correct previous stage', () => {
      expect(getPreviousStage('series-a')).toBe('seed');
      expect(getPreviousStage('seed')).toBe('pre-seed');
    });

    it('returns null for first stage', () => {
      expect(getPreviousStage('pre-seed')).toBeNull();
    });
  });
});