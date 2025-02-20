import { ErrorReporter } from '../utils/errorReporting';

describe('ErrorReporter', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize and cleanup error listeners', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    ErrorReporter.init();
    expect(addSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('error', expect.any(Function));

    ErrorReporter.cleanup();
    expect(removeSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should store and retrieve errors', () => {
    const testError = new Error('Test error');
    ErrorReporter.report(testError, 'Component stack');

    const storedErrors = ErrorReporter.getStoredErrors();
    expect(storedErrors).toHaveLength(1);
    expect(storedErrors[0]).toMatchObject({
      errorType: 'Error',
      message: 'Test error',
      componentStack: 'Component stack'
    });
  });

  it('should limit stored errors to 10', () => {
    for (let i = 0; i < 12; i++) {
      ErrorReporter.report(new Error(`Error ${i}`));
    }

    const storedErrors = ErrorReporter.getStoredErrors();
    expect(storedErrors).toHaveLength(10);
    expect(storedErrors[9].message).toBe('Error 11');
  });

  it('should handle error subscribers', () => {
    const mockCallback = jest.fn();
    const unsubscribe = ErrorReporter.subscribe(mockCallback);

    const testError = new Error('Test error');
    ErrorReporter.report(testError);

    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
      errorType: 'Error',
      message: 'Test error'
    }));

    unsubscribe();
    ErrorReporter.report(new Error('Another error'));
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should identify recoverable errors correctly', () => {
    const recoverableError = new Error('Network error');
    const syntaxError = new SyntaxError('Invalid syntax');
    
    expect(ErrorReporter.isRecoverable({ 
      errorType: recoverableError.name,
      message: recoverableError.message,
      timestamp: Date.now(),
      stage: 'assessment'
    })).toBe(true);

    expect(ErrorReporter.isRecoverable({
      errorType: syntaxError.name,
      message: syntaxError.message,
      timestamp: Date.now(),
      stage: 'assessment'
    })).toBe(false);
  });

  it('should attempt recovery with stored user responses', async () => {
    const mockResponses = { 'question-1': 3 };
    const errorReport = {
      timestamp: Date.now(),
      stage: 'assessment',
      errorType: 'Error',
      message: 'Recoverable error',
      userResponses: mockResponses
    };

    const recovered = await ErrorReporter.attemptRecovery(errorReport);
    expect(recovered).toBe(true);
    expect(sessionStorage.getItem('assessment_responses')).toBe(JSON.stringify(mockResponses));
  });

  it('should handle unhandled rejections', () => {
    ErrorReporter.init();
    const mockRejection = new Error('Promise rejection');
    
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
      reason: mockRejection,
      promise: Promise.reject(mockRejection),
      cancelable: true
    }));

    const storedErrors = ErrorReporter.getStoredErrors();
    expect(storedErrors[0]).toMatchObject({
      errorType: 'Error',
      message: 'Promise rejection'
    });
  });
});