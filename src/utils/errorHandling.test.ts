import {
  ValidationFailedError,
  StorageFailedError,
  NavigationFailedError,
  StateTransitionError,
  handleError,
  isAssessmentError
} from './errorHandling';
import { trackErrorWithRecovery } from './analytics';

jest.mock('./analytics');

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ValidationFailedError', () => {
    it('creates error with correct properties', () => {
      const error = new ValidationFailedError(
        'responses',
        'required',
        'Responses are required'
      );

      expect(error.field).toBe('responses');
      expect(error.constraint).toBe('required');
      expect(error.severity).toBe('medium');
      expect(error.recoverable).toBe(true);
      expect(error.context).toEqual({
        field: 'responses',
        constraint: 'required'
      });
    });
  });

  describe('StorageFailedError', () => {
    it('handles read failures', () => {
      const error = new StorageFailedError('read', 'responses');
      
      expect(error.operation).toBe('read');
      expect(error.key).toBe('responses');
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(true);
    });

    it('handles write failures', () => {
      const error = new StorageFailedError('write');
      
      expect(error.operation).toBe('write');
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(false);
    });
  });

  describe('NavigationFailedError', () => {
    it('creates error with navigation context', () => {
      const error = new NavigationFailedError(
        '/assessment',
        '/summary',
        'Incomplete responses'
      );

      expect(error.from).toBe('/assessment');
      expect(error.to).toBe('/summary');
      expect(error.reason).toBe('Incomplete responses');
      expect(error.severity).toBe('medium');
    });
  });

  describe('StateTransitionError', () => {
    it('creates error with state transition details', () => {
      const error = new StateTransitionError(
        'stage',
        'pre-seed',
        'series-a'
      );

      expect(error.stateKey).toBe('stage');
      expect(error.expectedState).toBe('pre-seed');
      expect(error.actualState).toBe('series-a');
      expect(error.severity).toBe('high');
    });
  });

  describe('handleError', () => {
    it('attempts recovery when possible', async () => {
      const error = new ValidationFailedError(
        'responses',
        'required',
        'Missing responses'
      );
      const mockRecover = jest.fn().mockResolvedValue(true);

      const result = await handleError(error, mockRecover);

      expect(result).toBe(true);
      expect(mockRecover).toHaveBeenCalled();
      expect(trackErrorWithRecovery).toHaveBeenCalledWith(
        error,
        true,
        true
      );
    });

    it('handles failed recovery attempts', async () => {
      const error = new StorageFailedError('read');
      const mockRecover = jest.fn().mockRejectedValue(new Error('Recovery failed'));

      const result = await handleError(error, mockRecover);

      expect(result).toBe(false);
      expect(trackErrorWithRecovery).toHaveBeenCalledWith(
        error,
        true,
        false
      );
    });

    it('skips recovery for non-recoverable errors', async () => {
      const error = new StorageFailedError('write');
      const mockRecover = jest.fn();

      const result = await handleError(error, mockRecover);

      expect(result).toBe(false);
      expect(mockRecover).not.toHaveBeenCalled();
    });
  });

  describe('isAssessmentError', () => {
    it('identifies assessment errors correctly', () => {
      expect(isAssessmentError(new ValidationFailedError('field', 'constraint', 'msg'))).toBe(true);
      expect(isAssessmentError(new Error('Generic error'))).toBe(false);
      expect(isAssessmentError(null)).toBe(false);
      expect(isAssessmentError(undefined)).toBe(false);
    });
  });
});