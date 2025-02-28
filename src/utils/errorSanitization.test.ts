import { AssessmentError } from '../types/errors';
import {
  sanitizeError,
  sanitizeStackTrace,
  createSafeErrorMessage,
  shouldExposeErrorDetails
} from './errorSanitization';

describe('errorSanitization', () => {
  describe('sanitizeError', () => {
    it('removes sensitive information from error messages', () => {
      const error = new Error('Failed to authenticate: api_key=abc123, password=secret');
      const sanitized = sanitizeError(error);
      
      expect(sanitized.message).not.toContain('abc123');
      expect(sanitized.message).not.toContain('secret');
      expect(sanitized.message).toContain('[REDACTED]');
    });

    it('replaces technical messages with user-friendly ones', () => {
      const error = new Error('network failure: connection refused');
      const sanitized = sanitizeError(error);
      
      expect(sanitized.message).toBe('Unable to connect to the server');
    });

    it('preserves AssessmentError properties', () => {
      const error = new AssessmentError('Test error', {
        severity: 'high',
        recoverable: false,
        context: {
          component: 'TestComponent',
          action: 'testAction',
          timestamp: '2024-01-01T00:00:00.000Z'
        }
      });

      const sanitized = sanitizeError(error);
      
      expect(sanitized.severity).toBe('high');
      expect(sanitized.recoverable).toBe(false);
      expect(sanitized.context).toEqual(error.context);
    });
  });

  describe('sanitizeStackTrace', () => {
    it('removes sensitive information from stack traces', () => {
      const stack = `
        Error: Authentication failed
            at authenticateUser (/app/auth.js:123:45)
            at processRequest (/app/api_key=abc123/handler.js:67:89)
            at Object.handle [as password=secret] (/app/middleware.js:12:34)
      `;

      const sanitized = sanitizeStackTrace(stack);
      
      expect(sanitized).not.toContain('api_key=abc123');
      expect(sanitized).not.toContain('password=secret');
      expect(sanitized).toContain('[REDACTED]');
    });

    it('returns empty string for undefined stack', () => {
      expect(sanitizeStackTrace(undefined)).toBe('');
    });
  });

  describe('createSafeErrorMessage', () => {
    it('creates user-friendly error message with type', () => {
      const error = new AssessmentError('Database connection failed', {
        severity: 'high'
      });

      const message = createSafeErrorMessage(error);
      expect(message).toBe('A data storage error occurred (AssessmentError)');
    });
  });

  describe('shouldExposeErrorDetails', () => {
    it('returns true for recoverable non-critical AssessmentErrors', () => {
      const error = new AssessmentError('Test error', {
        severity: 'medium',
        recoverable: true
      });

      expect(shouldExposeErrorDetails(error)).toBe(true);
    });

    it('returns false for critical AssessmentErrors', () => {
      const error = new AssessmentError('Critical error', {
        severity: 'critical',
        recoverable: false
      });

      expect(shouldExposeErrorDetails(error)).toBe(false);
    });

    it('depends on NODE_ENV for non-AssessmentErrors', () => {
      const originalEnv = process.env.NODE_ENV;
      const error = new Error('Test error');

      process.env.NODE_ENV = 'development';
      expect(shouldExposeErrorDetails(error)).toBe(true);

      process.env.NODE_ENV = 'production';
      expect(shouldExposeErrorDetails(error)).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });
});