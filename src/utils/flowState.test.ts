import { getResumePoint, validateStageProgression } from './flowState';
import { getAssessmentResponses, getAssessmentMetadata } from './storage';

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
    it('allows progression to next stage', () => {
      expect(validateStageProgression('pre-seed', 'seed')).toBe(true);
      expect(validateStageProgression('seed', 'series-a')).toBe(true);
    });

    it('allows moving to previous stages', () => {
      expect(validateStageProgression('series-a', 'seed')).toBe(true);
      expect(validateStageProgression('series-a', 'pre-seed')).toBe(true);
    });

    it('prevents skipping stages forward', () => {
      expect(validateStageProgression('pre-seed', 'series-a')).toBe(false);
    });

    it('allows staying in current stage', () => {
      expect(validateStageProgression('seed', 'seed')).toBe(true);
    });
  });
});