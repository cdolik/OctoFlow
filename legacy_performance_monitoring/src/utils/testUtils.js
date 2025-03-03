import { getAssessmentResponses, getStoredScores } from '../utils/storage';
import { categories, stageConfiguration } from '../data/categories';
import { GITHUB_GLOSSARY } from '../data/GITHUB_GLOSSARY';
import { render, fireEvent } from '@testing-library/react';
import { stages } from '../data/categories';
import { FLOW_STATES } from '../utils/flowValidator';

// Testing utilities for OctoFlow
export const mockAssessmentResponse = {
  'sec-1': 3,
  'eco-1': 2,
  'auto-1': 4
};

export const simulateError = () => {
  throw new Error('Simulated error for testing');
};

export const validateSessionStorage = () => {
  const testKey = 'test-response';
  const testValue = { id: 'test', score: 3 };
  
  try {
    // Test writing
    sessionStorage.setItem(testKey, JSON.stringify(testValue));
    
    // Test reading
    const stored = JSON.parse(sessionStorage.getItem(testKey));
    
    // Cleanup
    sessionStorage.removeItem(testKey);
    
    return stored.id === testValue.id && stored.score === testValue.score;
  } catch (error) {
    console.error('SessionStorage validation failed:', error);
    return false;
  }
};

export const validateAnalytics = () => {
  let events = [];
  
  // Override console.log temporarily
  const originalLog = console.log;
  console.log = (msg, data) => {
    if (msg.startsWith('[Analytics]')) {
      events.push({ msg, data });
    }
  };
  
  return {
    getEvents: () => events,
    restore: () => {
      console.log = originalLog;
    }
  };
};

export const validateImplementation = () => {
  const validationResults = {
    issues: [],
    warnings: []
  };

  // 1. Validate Category Structure
  categories.forEach(category => {
    if (!category.weight || category.weight <= 0) {
      validationResults.issues.push(`Invalid weight for category: ${category.id}`);
    }
    if (!category.questions || category.questions.length === 0) {
      validationResults.issues.push(`No questions found for category: ${category.id}`);
    }
  });

  // 2. Validate Stage Configuration
  Object.entries(stageConfiguration).forEach(([stage, config]) => {
    if (!config.focusCategories || config.focusCategories.length === 0) {
      validationResults.warnings.push(`No focus categories defined for stage: ${stage}`);
    }
  });

  // 3. Validate Tooltips
  const tooltipTerms = new Set();
  categories.forEach(category => {
    category.questions.forEach(question => {
      if (question.tooltipTerm && !GITHUB_GLOSSARY[question.tooltipTerm]) {
        validationResults.issues.push(`Missing glossary entry for term: ${question.tooltipTerm}`);
      }
      if (question.tooltipTerm) {
        tooltipTerms.add(question.tooltipTerm);
      }
    });
  });

  // 4. Validate Storage Integration
  try {
    const testResponse = { 'test-id': 1 };
    sessionStorage.setItem('test', JSON.stringify(testResponse));
    sessionStorage.removeItem('test');
  } catch (error) {
    validationResults.issues.push('SessionStorage not available');
  }

  return validationResults;
};

export const simulateAssessmentFlow = async (stage = 'pre-seed') => {
  const flowResults = {
    events: [],
    errors: []
  };

  try {
    // 1. Start Assessment
    const stageQuestions = categories.flatMap(cat => cat.questions);
    
    // 2. Answer Questions
    stageQuestions.forEach((question, index) => {
      const mockAnswer = Math.floor(Math.random() * 4) + 1;
      flowResults.events.push({
        step: `Question ${index + 1}`,
        questionId: question.id,
        answer: mockAnswer
      });
    });

    // 3. Verify Storage
    const responses = getAssessmentResponses();
    const scores = getStoredScores();

    if (!responses || Object.keys(responses).length === 0) {
      flowResults.errors.push('Responses not properly stored');
    }
    if (!scores) {
      flowResults.errors.push('Scores not calculated/stored');
    }

  } catch (error) {
    flowResults.errors.push(`Flow error: ${error.message}`);
  }

  return flowResults;
};

export const renderWithStage = (component, stage = 'pre-seed') => {
  const utils = render(component);
  return {
    stage,
    ...utils,
  };
};

export const mockAssessmentState = ({
  stage = 'pre-seed',
  responses = {},
  flowState = FLOW_STATES.ASSESSMENT,
  metadata = {}
} = {}) => {
  const state = {
    stage,
    responses,
    currentState: flowState,
    metadata: {
      startTime: Date.now() - 300000, // 5 minutes ago
      lastInteraction: Date.now() - 60000, // 1 minute ago
      questionCount: Object.keys(responses).length,
      ...metadata
    }
  };

  sessionStorage.setItem('octoflow', JSON.stringify(state));
  return state;
};

export const expectScoreInRange = (score, stage) => {
  const stageBenchmarks = stages.find(s => s.id === stage)?.benchmarks;
  if (!stageBenchmarks) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  const { expectedScores } = stageBenchmarks;
  Object.entries(expectedScores).forEach(([category, benchmark]) => {
    expect(score[category]).toBeDefined();
    expect(score[category]).toBeGreaterThanOrEqual(0);
    expect(score[category]).toBeLessThanOrEqual(4);
    // Should be within reasonable range of benchmark
    expect(Math.abs(score[category] - benchmark)).toBeLessThanOrEqual(2);
  });
};

export const mockAnalytics = () => ({
  trackStageSelect: jest.fn(),
  trackQuestionAnswer: jest.fn(),
  trackAssessmentComplete: jest.fn(),
  trackError: jest.fn(),
  trackResourceClick: jest.fn()
});

export const simulateUserJourney = async (component, { stage = 'pre-seed', answers = {} } = {}) => {
  const utils = render(component);

  // Select stage
  const stageButton = utils.getByText(new RegExp(stage, 'i'));
  fireEvent.click(stageButton);

  // Answer questions
  for (const [, answer] of Object.entries(answers)) {
    const options = utils.getAllByRole('button', { name: /option/i });
    fireEvent.click(options[answer - 1]);
    
    const nextButton = utils.getByText(/next|complete/i);
    fireEvent.click(nextButton);
  }

  return utils;
};

export const createTimingContext = (timestamps = {}) => {
  let currentTime = Date.now();
  const timeLog = new Map();

  return {
    advanceTime: (ms) => {
      currentTime += ms;
      jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    },
    logTime: (marker) => {
      timeLog.set(marker, currentTime);
    },
    getTimeSpent: (start, end) => {
      return timeLog.get(end) - timeLog.get(start);
    },
    reset: () => {
      jest.restoreAllMocks();
      timeLog.clear();
    }
  };
};

export const expectValidScores = (scores, stage) => {
  expect(scores.overallScore).toBeGreaterThan(0);
  expect(scores.overallScore).toBeLessThanOrEqual(4);
  expect(scores.completionRate).toBeGreaterThan(0);
  expect(scores.completionRate).toBeLessThanOrEqual(1);
  
  Object.entries(scores.categoryScores).forEach(([category, score]) => {
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(4);
  });
};

export const mockAnalyticsEvents = () => {
  const events = [];
  jest.spyOn(console, 'log').mockImplementation((prefix, data) => {
    if (prefix.startsWith('[Analytics]')) {
      events.push({
        type: prefix.replace('[Analytics] ', '').replace(':', ''),
        data
      });
    }
  });
  return {
    getEvents: () => events,
    getEventsByType: (type) => events.filter(e => e.type === type),
    clear: () => {
      events.length = 0;
    }
  };
};

export const expectStateTransition = (from, to) => {
  const state = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  expect(state.currentState).toBe(to);
  
  const events = mockAnalyticsEvents().getEvents();
  const navEvent = events.find(e => 
    e.type === 'navigation' && 
    e.data.from === from && 
    e.data.to === to
  );
  expect(navEvent).toBeTruthy();
};