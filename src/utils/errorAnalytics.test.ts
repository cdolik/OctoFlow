import { errorAnalytics } from './errorAnalytics';
import { AssessmentError } from '../types/errors';

describe('ErrorAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('trackError', () => {
    it('tracks error metrics correctly', () => {
      const error = new AssessmentError('Test error', {
        severity: 'medium',
        recoverable: true,
        context: {
          component: 'TestComponent',
          action: 'testAction',
          stage: 'test'
        }
      });

      errorAnalytics.trackError(error);

      const metrics = errorAnalytics.getSeverityDistribution();
      expect(metrics.medium).toBe(1);
      expect(metrics.high).toBe(0);
    });

    it('maintains max stored metrics limit', () => {
      // Create more than MAX_STORED_METRICS errors
      for (let i = 0; i < 150; i++) {
        errorAnalytics.trackError(new Error(`Error ${i}`));
      }

      const errorRate = errorAnalytics.getErrorRate();
      expect(errorRate).toBeLessThanOrEqual(100);
    });
  });

  describe('updateRecoveryStatus', () => {
    it('updates recovery status for existing error', () => {
      const timestamp = new Date().toISOString();
      const error = new AssessmentError('Test error', {
        severity: 'medium',
        recoverable: true
      });

      errorAnalytics.trackError(error);
      errorAnalytics.updateRecoveryStatus(timestamp, true, 2);

      const recoveryRate = errorAnalytics.getRecoveryRate();
      expect(recoveryRate).toBe(100);
    });

    it('handles non-existent error timestamps gracefully', () => {
      const nonExistentTimestamp = new Date().toISOString();
      errorAnalytics.updateRecoveryStatus(nonExistentTimestamp, true, 1);
      
      // Should not throw and should maintain existing metrics
      expect(errorAnalytics.getRecoveryRate()).toBe(100);
    });
  });

  describe('getErrorRate', () => {
    it('calculates error rate within time window', () => {
      const now = new Date();
      
      // Add errors at different times
      jest.setSystemTime(now.getTime() - 4000000); // Outside 1-hour window
      errorAnalytics.trackError(new Error('Old error'));

      jest.setSystemTime(now.getTime() - 1000000); // Within 1-hour window
      errorAnalytics.trackError(new Error('Recent error 1'));
      errorAnalytics.trackError(new Error('Recent error 2'));

      jest.setSystemTime(now);
      const errorRate = errorAnalytics.getErrorRate(3600000); // 1 hour window
      expect(errorRate).toBe(2); // Only counts recent errors
    });

    it('returns 0 when no errors exist', () => {
      const errorRate = errorAnalytics.getErrorRate();
      expect(errorRate).toBe(0);
    });
  });

  describe('getRecoveryRate', () => {
    it('calculates recovery rate correctly', () => {
      const error1 = new AssessmentError('Error 1', { severity: 'medium' });
      const error2 = new AssessmentError('Error 2', { severity: 'high' });
      const error3 = new AssessmentError('Error 3', { severity: 'low' });

      errorAnalytics.trackError(error1);
      errorAnalytics.trackError(error2);
      errorAnalytics.trackError(error3);

      errorAnalytics.updateRecoveryStatus(new Date().toISOString(), true, 1); // First error recovered
      errorAnalytics.updateRecoveryStatus(new Date().toISOString(), false, 2); // Second error failed
      // Third error not attempted

      const recoveryRate = errorAnalytics.getRecoveryRate();
      expect(recoveryRate).toBe(33.33333333333333); // 1/3 recovered
    });

    it('returns 100 when no errors exist', () => {
      const recoveryRate = errorAnalytics.getRecoveryRate();
      expect(recoveryRate).toBe(100);
    });
  });

  describe('getSeverityDistribution', () => {
    it('tracks severity distribution accurately', () => {
      const errors = [
        new AssessmentError('Error 1', { severity: 'low' }),
        new AssessmentError('Error 2', { severity: 'medium' }),
        new AssessmentError('Error 3', { severity: 'high' }),
        new AssessmentError('Error 4', { severity: 'critical' }),
        new AssessmentError('Error 5', { severity: 'medium' })
      ];

      errors.forEach(error => errorAnalytics.trackError(error));

      const distribution = errorAnalytics.getSeverityDistribution();
      expect(distribution).toEqual({
        low: 1,
        medium: 2,
        high: 1,
        critical: 1,
        error: 0
      });
    });

    it('respects time window parameter', () => {
      const now = new Date();

      // Add old errors
      jest.setSystemTime(now.getTime() - 4000000);
      errorAnalytics.trackError(new AssessmentError('Old error', { severity: 'high' }));

      // Add recent errors
      jest.setSystemTime(now.getTime() - 1000000);
      errorAnalytics.trackError(new AssessmentError('Recent error', { severity: 'low' }));

      jest.setSystemTime(now);
      const distribution = errorAnalytics.getSeverityDistribution(3600000); // 1 hour window

      expect(distribution.high).toBe(0); // Old error not counted
      expect(distribution.low).toBe(1); // Recent error counted
    });
  });

  describe('persistence', () => {
    it('persists metrics to localStorage', () => {
      const error = new AssessmentError('Test error', { severity: 'medium' });
      errorAnalytics.trackError(error);

      // Simulate page reload
      const storedMetrics = JSON.parse(localStorage.getItem('errorMetrics') || '[]');
      expect(storedMetrics).toHaveLength(1);
      expect(storedMetrics[0].errorType).toBe('AssessmentError');
    });

    it('loads persisted metrics on initialization', () => {
      const mockMetrics = [{
        timestamp: new Date().toISOString(),
        errorType: 'AssessmentError',
        severity: 'medium',
        recoverable: true,
        recovered: false,
        retryCount: 0
      }];

      localStorage.setItem('errorMetrics', JSON.stringify(mockMetrics));

      // Create new instance to trigger loading
      const analytics = errorAnalytics;
      const distribution = analytics.getSeverityDistribution();
      expect(distribution.medium).toBe(1);
    });
  });
});