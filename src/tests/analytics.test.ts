import { 
  trackStageSelect,
  trackAssessmentComplete,
  trackQuestionAnswer,
  trackError,
  trackResourceClick,
  trackStageTransition
} from '../utils/analytics';
import { Stage } from '../types';

declare global {
  interface Window {
    performance: {
      memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      };
    };
  }
}

describe('Analytics Tracking', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Progress Analytics', () => {
    it('should track stage selection with context', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackStageSelect('pre-seed' as Stage);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] stage_selected:',
        expect.objectContaining({
          stage: 'pre-seed',
          source: expect.any(String)
        })
      );
    });

    it('should track stage transitions', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackStageTransition('pre-seed' as Stage, 'seed' as Stage);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] stage_transition:',
        expect.objectContaining({
          from: 'pre-seed',
          to: 'seed',
          timestamp: expect.any(Number)
        })
      );
    });

    it('should track resource clicks', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackResourceClick('documentation', 'https://example.com');

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] resource_clicked:',
        expect.objectContaining({
          resourceType: 'documentation',
          url: 'https://example.com',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Error Analytics', () => {
    it('should track errors with context', () => {
      const consoleLog = jest.spyOn(console, 'log');
      const error = new Error('Test error');
      trackError(error, {
        recoveryAttempted: true,
        recovered: false
      });

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] error_occurred:',
        expect.objectContaining({
          type: 'Error',
          message: 'Test error',
          recoveryAttempted: true,
          recovered: false
        })
      );
    });
  });

  describe('User Interaction Analytics', () => {
    it('should track question answers with timing', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackQuestionAnswer('github-workflow', 3, 15000);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] question_answered:',
        expect.objectContaining({
          questionId: 'github-workflow',
          answer: 3,
          timeSpent: 15000,
          isCorrection: expect.any(Boolean)
        })
      );
    });

    it('should track assessment completion with scores', () => {
      const scores = {
        'github-ecosystem': 75,
        'security': 85
      };
      const consoleLog = jest.spyOn(console, 'log');
      trackAssessmentComplete(scores, 'pre-seed' as Stage);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] assessment_completed:',
        expect.objectContaining({
          scores,
          stage: 'pre-seed',
          completionTime: expect.any(Number),
          questionCount: 2
        })
      );
    });
  });
});