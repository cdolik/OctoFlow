import { 
  BaseAssessmentError,
  StorageFailedError,
  NavigationFailedError,
  createErrorContext,
  isRecoverableError
} from '../utils/errorHandling';
import { trackError } from '../utils/analytics';

jest.mock('../utils/analytics', () => ({
  trackError: jest.fn()
}));

describe('Error Handling System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Classes', () => {
    it('should create BaseAssessmentError with correct properties', () => {
      const error = new BaseAssessmentError('test error');
      expect(error.severity).toBe('medium');
      expect(error.recoverable).toBe(true);
      expect(error.message).toBe('test error');
    });

    it('should create StorageFailedError with operation info', () => {
      const error = new StorageFailedError('read', 'failed to read');
      expect(error.operation).toBe('read');
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(true);
    });

    it('should create NavigationFailedError with navigation context', () => {
      const error = new NavigationFailedError(
        'navigation failed',
        'home',
        'settings',
        'invalid transition'
      );
      expect(error.from).toBe('home');
      expect(error.to).toBe('settings');
      expect(error.reason).toBe('invalid transition');
    });
  });

  describe('Error Context Creation', () => {
    it('should create error context with required fields', () => {
      const context = createErrorContext(
        'TestComponent',
        'testAction',
        'Test message'
      );

      expect(context).toEqual({
        component: 'TestComponent',
        action: 'testAction',
        message: 'Test message',
        timestamp: expect.any(String)
      });
    });

    it('should include optional metadata', () => {
      const metadata = { key: 'value' };
      const context = createErrorContext(
        'TestComponent',
        'testAction',
        'Test message',
        metadata
      );

      expect(context).toEqual({
        component: 'TestComponent',
        action: 'testAction',
        message: 'Test message',
        timestamp: expect.any(String),
        metadata
      });
    });
  });

  describe('Error Classification', () => {
    it('should identify recoverable errors', () => {
      const error = new StorageFailedError('read');
      expect(isRecoverableError(error)).toBe(true);
    });

    it('should identify critical errors as unrecoverable', () => {
      const error = new Error('critical system failure');
      expect(isRecoverableError(error)).toBe(false);
    });
  });
});