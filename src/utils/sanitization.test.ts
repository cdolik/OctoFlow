import {
  sanitizeErrorMessage,
  sanitizeError,
  sanitizeErrorContext
} from './sanitization';

describe('Error Sanitization Utils', () => {
  describe('sanitizeErrorMessage', () => {
    it('removes sensitive data patterns', () => {
      const message = 'Failed to authenticate: token=abc123 key=xyz789';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).toBe('Failed to authenticate: [REDACTED] [REDACTED]');
    });

    it('truncates long messages', () => {
      const longMessage = 'x'.repeat(200);
      const sanitized = sanitizeErrorMessage(longMessage);
      expect(sanitized.length).toBeLessThan(160); // 150 + '...'
      expect(sanitized.endsWith('...')).toBe(true);
    });

    it('removes HTML tags', () => {
      const message = 'Error <script>alert("xss")</script> occurred';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).toBe('Error alert("xss") occurred');
    });

    it('removes file paths', () => {
      const message = 'Error in /Users/name/project/file.ts';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).toBe('Error in [PATH]');
    });
  });

  describe('sanitizeError', () => {
    it('preserves AssessmentError properties', () => {
      const error = new Error('Test error');
      Object.assign(error, {
        severity: 'high',
        recoverable: true,
        context: { path: '/sensitive/path' }
      });

      const sanitized = sanitizeError(error);
      expect(sanitized.message).toBe('Test error');
      expect(sanitized).toHaveProperty('severity', 'high');
      expect(sanitized).toHaveProperty('recoverable', true);
      expect(sanitized).toHaveProperty('context', { path: '[PATH]' });
    });

    it('sanitizes stack traces', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at /Users/name/file.ts:123:45';
      
      const sanitized = sanitizeError(error);
      expect(sanitized.stack).not.toContain('/Users/name');
      expect(sanitized.stack).toContain('[PATH]');
    });
  });

  describe('sanitizeErrorContext', () => {
    it('handles nested objects', () => {
      const context = {
        outer: {
          inner: {
            token: 'secret123',
            path: '/Users/name/file.ts'
          }
        }
      };

      const sanitized = sanitizeErrorContext(context);
      expect(sanitized).toEqual({
        outer: {
          inner: {
            token: '[REDACTED]',
            path: '[PATH]'
          }
        }
      });
    });

    it('preserves non-sensitive data', () => {
      const context = {
        errorCode: 500,
        timestamp: 1234567890,
        metadata: {
          attempts: 3
        }
      };

      const sanitized = sanitizeErrorContext(context);
      expect(sanitized).toEqual(context);
    });

    it('returns undefined for undefined input', () => {
      expect(sanitizeErrorContext(undefined)).toBeUndefined();
    });
  });
});