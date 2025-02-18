import { 
  trackStageSelect, 
  trackQuestionAnswer, 
  trackAssessmentComplete,
  trackError,
  trackResourceClick,
  trackNavigation,
  trackRecommendationClick,
  trackInteractionPattern,
  trackTimeOnQuestion,
  trackNavigationFlow
} from '../utils/analytics';

describe('Analytics Integration', () => {
  let consoleLog;
  const mockTimestamp = 1234567890;

  beforeEach(() => {
    consoleLog = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp);
    sessionStorage.clear();
  });

  afterEach(() => {
    consoleLog.mockRestore();
    jest.restoreAllMocks();
  });

  test('tracks stage selection with metadata', () => {
    trackStageSelect('pre-seed');
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] stage_selected:',
      expect.objectContaining({
        stage: 'pre-seed',
        timestamp: expect.any(Number)
      })
    );
  });

  test('tracks question answers with timing', () => {
    trackQuestionAnswer('codeowners', 3, 15000);
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] question_answered:',
      expect.objectContaining({
        questionId: 'codeowners',
        answer: 3,
        timeSpent: 15000,
        timestamp: expect.any(Number)
      })
    );
  });

  test('tracks assessment completion with scores', () => {
    const mockScores = {
      overallScore: 3.5,
      categoryScores: {
        'github-ecosystem': 3.2,
        'security': 3.8
      }
    };
    trackAssessmentComplete(mockScores, 'pre-seed');
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] assessment_completed:',
      expect.objectContaining({
        scores: mockScores,
        stage: 'pre-seed',
        timestamp: expect.any(Number)
      })
    );
  });

  test('tracks error events with context', () => {
    const error = new Error('Test error');
    trackError('assessment_error', {
      message: error.message,
      stack: error.stack
    });
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] error_occurred:',
      expect.objectContaining({
        type: 'assessment_error',
        details: expect.objectContaining({
          message: 'Test error'
        }),
        userAgent: expect.any(String)
      })
    );
  });

  test('tracks recommendation interactions', () => {
    trackRecommendationClick('CODEOWNERS', 'github-ecosystem');
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] recommendation_clicked:',
      expect.objectContaining({
        recommendationId: 'CODEOWNERS',
        category: 'github-ecosystem',
        timestamp: expect.any(Number)
      })
    );
  });

  test('tracks resource link clicks', () => {
    const url = 'https://docs.github.com/some-doc';
    trackResourceClick('github_docs', url);
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] cta_clicked:',
      expect.objectContaining({
        type: 'github_docs',
        url,
        timestamp: expect.any(Number)
      })
    );
  });

  test('tracks navigation between components', () => {
    trackNavigation('StageSelector', 'Assessment');
    expect(consoleLog).toHaveBeenCalledWith(
      '[Analytics] navigation:',
      expect.objectContaining({
        from: 'StageSelector',
        to: 'Assessment',
        timestamp: expect.any(Number)
      })
    );
  });

  describe('Interaction Pattern Tracking', () => {
    test('tracks user interaction patterns', () => {
      const mockState = {
        stage: 'pre-seed',
        metadata: { lastInteraction: mockTimestamp - 5000 }
      };
      sessionStorage.setItem('octoflow', JSON.stringify(mockState));

      trackInteractionPattern('question-1', 'hover', { duration: 1500 });

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] user_interaction:',
        expect.objectContaining({
          questionId: 'question-1',
          type: 'hover',
          details: { duration: 1500 },
          durationSinceLastInteraction: 5000,
          sessionId: expect.any(String),
          timestamp: mockTimestamp
        })
      );
    });

    test('handles new sessions correctly', () => {
      trackInteractionPattern('question-1', 'click', {});
      
      const firstCall = consoleLog.mock.calls[0][1];
      const sessionId = firstCall.sessionId;

      trackInteractionPattern('question-2', 'click', {});
      const secondCall = consoleLog.mock.calls[1][1];

      expect(secondCall.sessionId).toBe(sessionId);
    });
  });

  describe('Time Tracking', () => {
    test('tracks time spent on questions', () => {
      const mockState = {
        metadata: {
          questionTimes: [40000, 50000]
        }
      };
      sessionStorage.setItem('octoflow', JSON.stringify(mockState));

      trackTimeOnQuestion('question-1', 30000, false);

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] question_time:',
        expect.objectContaining({
          questionId: 'question-1',
          timeSpent: 30000,
          wasModified: false,
          averageTimeForStage: 45000
        })
      );
    });
  });

  describe('Navigation Flow Tracking', () => {
    test('tracks navigation with assessment time', () => {
      const startTime = mockTimestamp - 300000; // 5 minutes ago
      const mockState = {
        metadata: { startTime }
      };
      sessionStorage.setItem('octoflow', JSON.stringify(mockState));

      trackNavigationFlow('Assessment', 'Summary', 'next-button');

      expect(consoleLog).toHaveBeenCalledWith(
        '[Analytics] navigation:',
        expect.objectContaining({
          from: 'Assessment',
          to: 'Summary',
          trigger: 'next-button',
          totalAssessmentTime: 300000
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('continues tracking even with corrupt storage', () => {
      sessionStorage.setItem('octoflow', 'invalid-json');

      trackInteractionPattern('question-1', 'click', {});

      expect(consoleLog).toHaveBeenCalled();
      expect(consoleLog.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          questionId: 'question-1',
          type: 'click'
        })
      );
    });
  });
});