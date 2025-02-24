import { trackAssessmentComplete, trackAssessmentStart, trackStageTransition, trackError } from './analytics';
import { createMockState } from './testUtils';

describe('Analytics', () => {
  let mockLocalStorage: { [key: string]: string } = {};
  
  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Storage.prototype.getItem = jest.fn(
      (key: string) => mockLocalStorage[key] || null
    );
    Storage.prototype.setItem = jest.fn(
      (key: string, value: string) => { mockLocalStorage[key] = value; }
    );

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });

    // Mock console.log for development environment
    console.log = jest.fn();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('tracks assessment completion with correct metrics', () => {
    const mockState = createMockState({
      currentStage: 'pre-seed',
      responses: { q1: 4, q2: 3 },
      metadata: {
        timeSpent: 300,
        lastSaved: new Date().toISOString(),
        attemptCount: 1
      },
      progress: {
        totalQuestions: 5,
        questionIndex: 2,
        isComplete: true
      }
    });

    trackAssessmentComplete('pre-seed', mockState);
    
    expect(console.log).toHaveBeenCalledWith(
      'Analytics events:',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'assessment_complete',
          properties: expect.objectContaining({
            stage: 'pre-seed',
            timeSpent: 300,
            questionCount: 5,
            completedCount: 2,
            averageScore: 3.5
          })
        })
      ])
    );
  });

  it('tracks assessment start', () => {
    trackAssessmentStart('seed');

    expect(console.log).toHaveBeenCalledWith(
      'Analytics events:',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'assessment_start',
          properties: expect.objectContaining({
            stage: 'seed'
          })
        })
      ])
    );
  });

  it('tracks stage transitions', () => {
    trackStageTransition('pre-seed', 'seed');

    expect(console.log).toHaveBeenCalledWith(
      'Analytics events:',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'stage_transition',
          properties: expect.objectContaining({
            from: 'pre-seed',
            to: 'seed'
          })
        })
      ])
    );
  });

  it('tracks errors with context', () => {
    const error = new Error('Test error');
    const context = { component: 'TestComponent' };

    trackError(error, context);

    expect(console.log).toHaveBeenCalledWith(
      'Analytics events:',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'error',
          properties: expect.objectContaining({
            message: 'Test error',
            context: { component: 'TestComponent' }
          })
        })
      ])
    );
  });

  it('queues events when offline', () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false
    });

    trackAssessmentStart('pre-seed');

    // Check that event was saved to localStorage
    expect(mockLocalStorage['octoflow_analytics_queue']).toBeDefined();
    const queue = JSON.parse(mockLocalStorage['octoflow_analytics_queue']);
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      name: 'assessment_start',
      properties: { stage: 'pre-seed' }
    });
  });

  it('processes queued events when coming online', () => {
    // Start offline with queued events
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false
    });

    trackAssessmentStart('pre-seed');
    trackAssessmentComplete('pre-seed', createMockState({ currentStage: 'pre-seed' }));

    // Simulate coming online
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });

    // Trigger online event
    window.dispatchEvent(new Event('online'));

    // Check that queued events were processed
    expect(console.log).toHaveBeenCalledWith(
      'Analytics events:',
      expect.arrayContaining([
        expect.objectContaining({ name: 'assessment_start' }),
        expect.objectContaining({ name: 'assessment_complete' })
      ])
    );
  });

  it('handles local storage errors gracefully', () => {
    // Mock localStorage to throw error
    Storage.prototype.setItem = jest.fn().mockImplementation(() => {
      throw new Error('Storage full');
    });

    const consoleSpy = jest.spyOn(console, 'error');
    
    trackAssessmentStart('pre-seed');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save analytics queue:',
      expect.any(Error)
    );
  });
});