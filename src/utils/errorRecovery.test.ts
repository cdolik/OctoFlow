import { errorRecovery } from './errorRecovery';
import { AssessmentError } from '../types/errors';
import { errorAnalytics } from './errorAnalytics';

jest.mock('./errorAnalytics');

describe('ErrorRecoveryManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset network status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  describe('attemptRecovery', () => {
    it('attempts network error recovery when offline', async () => {
      const error = new AssessmentError('Network connection failed', {
        severity: 'medium',
        recoverable: true
      });
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        timestamp: new Date().toISOString()
      };

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const recovered = await errorRecovery.attemptRecovery(error, context);
      
      expect(recovered).toBe(false);
      expect(errorAnalytics.trackError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          action: 'recovery:Network connectivity check'
        }),
        false
      );
    });

    it('successfully recovers from storage errors', async () => {
      const error = new AssessmentError('Storage quota exceeded', {
        severity: 'high',
        recoverable: true
      });
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        timestamp: new Date().toISOString()
      };

      // Mock successful cache clearing
      global.caches = {
        keys: jest.fn().mockResolvedValue(['old-cache-1', 'old-cache-2']),
        delete: jest.fn().mockResolvedValue(true)
      } as unknown as CacheStorage;

      const recovered = await errorRecovery.attemptRecovery(error, context);
      
      expect(recovered).toBe(true);
      expect(global.caches.delete).toHaveBeenCalledTimes(2);
      expect(errorAnalytics.trackError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          action: 'recovery:Storage cleanup'
        }),
        true
      );
    });

    it('handles failed recovery attempts', async () => {
      const error = new AssessmentError('Critical system error', {
        severity: 'critical',
        recoverable: false
      });
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        timestamp: new Date().toISOString()
      };

      const recovered = await errorRecovery.attemptRecovery(error, context);
      
      expect(recovered).toBe(false);
      expect(errorAnalytics.trackError).toHaveBeenCalledWith(
        expect.any(AssessmentError),
        expect.objectContaining({
          action: expect.stringContaining('recovery_failed')
        })
      );
    });
  });

  describe('retryWithBackoff', () => {
    it('retries operation with exponential backoff', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      const result = await errorRecovery.retryWithBackoff(operation, {
        maxRetries: 3,
        retryDelay: 100,
        exponentialBackoff: true,
        onRetry
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it('throws error after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const onRetry = jest.fn();

      await expect(errorRecovery.retryWithBackoff(operation, {
        maxRetries: 2,
        retryDelay: 100,
        onRetry
      })).rejects.toThrow('Operation failed');

      expect(operation).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('uses constant delay when exponentialBackoff is false', async () => {
      jest.useFakeTimers();

      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockResolvedValue('success');

      const retryPromise = errorRecovery.retryWithBackoff(operation, {
        maxRetries: 2,
        retryDelay: 1000,
        exponentialBackoff: false
      });

      jest.advanceTimersByTime(1000);
      await retryPromise;

      expect(operation).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  });

  describe('custom recovery strategies', () => {
    it('allows registering custom recovery strategies', async () => {
      const customStrategy = {
        condition: (error: Error) => error.message.includes('custom'),
        action: async () => true,
        description: 'Custom recovery'
      };

      errorRecovery.registerStrategy(customStrategy);

      const error = new Error('custom error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        timestamp: new Date().toISOString()
      };

      const recovered = await errorRecovery.attemptRecovery(error, context);
      
      expect(recovered).toBe(true);
      expect(errorAnalytics.trackError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          action: 'recovery:Custom recovery'
        }),
        true
      );
    });
  });
});