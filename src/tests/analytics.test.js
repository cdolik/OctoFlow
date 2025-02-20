import { 
  trackStageSelect,
  trackAssessmentComplete,
  trackQuestionAnswer,
  trackErrorWithRecovery,
  trackSessionRestore,
  trackAutoSave,
  trackProgressUpdate,
  trackPerformanceMetric,
  trackSessionHealth
} from '../utils/analytics';

describe('Analytics Tracking', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Session Analytics', () => {
    it('should track session restoration attempts', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackSessionRestore(true, 'sessionStorage');

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] session_restore:',
        expect.objectContaining({
          success: true,
          source: 'sessionStorage',
          timestamp: expect.any(Number)
        })
      );
    });

    it('should track auto-save operations', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackAutoSave(true, 1024);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] auto_save:',
        expect.objectContaining({
          success: true,
          dataSize: 1024,
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Progress Analytics', () => {
    it('should track assessment progress updates', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackProgressUpdate(75, 'github-ecosystem');

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] progress_update:',
        expect.objectContaining({
          progress: 75,
          category: 'github-ecosystem',
          timeSpent: expect.any(Number)
        })
      );
    });

    it('should track stage selection with context', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackStageSelect('pre-seed');

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] stage_selected:',
        expect.objectContaining({
          stage: 'pre-seed',
          source: expect.any(String)
        })
      );
    });
  });

  describe('Performance Analytics', () => {
    it('should track performance metrics', () => {
      const metric = {
        type: 'navigation',
        duration: 1200,
        memory: window.performance.memory
      };

      const consoleLog = jest.spyOn(console, 'log');
      trackPerformanceMetric(metric);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] performance_metric:',
        expect.objectContaining({
          timestamp: expect.any(Number),
          deviceMemory: expect.any(Number),
          connection: expect.any(Object)
        })
      );
    });

    it('should track session health stats', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackSessionHealth();

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] session_health:',
        expect.objectContaining({
          storageSize: expect.any(Object),
          connectionStatus: expect.any(Boolean)
        })
      );
    });
  });

  describe('Error Analytics', () => {
    it('should track error recovery attempts', () => {
      const consoleLog = jest.spyOn(console, 'log');
      trackErrorWithRecovery(
        new Error('Test error'),
        true,
        false
      );

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] error_with_recovery:',
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
      trackAssessmentComplete(scores, 'pre-seed');

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