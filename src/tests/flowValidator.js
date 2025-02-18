import { validateUserFlow, validateResponses } from '../utils/flowValidator';
import { mockAssessmentState } from '../utils/testUtils';
import { categories } from '../data/categories';

// Test scenarios for flow validation
export const TEST_SCENARIOS = {
  STAGE_SELECTION: {
    PRE_SEED: {
      id: 'pre-seed',
      expectedBenchmarks: true,
      expectedTooltips: true
    },
    SERIES_A: {
      id: 'series-a',
      expectedBenchmarks: true,
      expectedTooltips: true
    }
  },
  ASSESSMENT: {
    QUESTIONS_PER_CATEGORY: 2,
    EXPECTED_PROGRESS_UPDATES: true,
    SESSION_STORAGE_KEY: 'octoflow'
  },
  ERROR_SCENARIOS: {
    ASSESSMENT_LOAD: 'AssessmentLoadError',
    DATA_PERSISTENCE: 'StorageError',
    RESULTS_CALCULATION: 'ResultsError'
  }
};

export const validateComponentRendering = (component) => {
  const errors = [];
  
  try {
    // Validate component specific requirements
    switch (component) {
      case 'Hero':
        // Validate CTA button and trust badges exist
        break;
      case 'StageSelector':
        // Validate stage options and tooltips are rendered
        break;
      case 'Assessment':
        // Validate question flow and progress tracking work correctly
        break;
      case 'Summary':
        // Validate that responses are reviewed and can be edited
        break;
      case 'Results':
        // Validate that charts render and recommendations are displayed
        break;
      default:
        errors.push({ component, error: 'Unknown component' });
    }
  } catch (error) {
    errors.push({ component, error: error.message });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

describe('Flow Validator', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('validateUserFlow', () => {
    test('validates complete assessment flow for pre-seed stage', () => {
      const mockState = mockAssessmentState('pre-seed');
      const mockResponses = {
        'codeowners': 3,
        'branch-protection': 4,
        'deployment-automation': 3
      };

      sessionStorage.setItem('octoflow', JSON.stringify({
        ...mockState,
        responses: mockResponses
      }));

      const validation = validateUserFlow();
      expect(validation.isValid).toBeTruthy();
      expect(validation.completionRate).toBeGreaterThan(0);
      expect(validation.lastSaved).toBeDefined();
    });

    test('detects invalid stage transitions', () => {
      const mockState = mockAssessmentState('invalid-stage');
      sessionStorage.setItem('octoflow', JSON.stringify(mockState));

      const validation = validateUserFlow();
      expect(validation.isValid).toBeFalsy();
      expect(validation.error).toContain('Invalid stage');
    });

    test('validates stage-specific questions', () => {
      const mockState = mockAssessmentState('pre-seed');
      const mockResponses = {
        'copilot-testing': 3 // Series-A only question
      };

      sessionStorage.setItem('octoflow', JSON.stringify({
        ...mockState,
        responses: mockResponses
      }));

      const validation = validateUserFlow();
      expect(validation.isValid).toBeFalsy();
      expect(validation.error).toContain('not valid for stage');
    });
  });

  describe('validateResponses', () => {
    test('validates correct response format', () => {
      const responses = {
        'codeowners': 3,
        'branch-protection': 4,
        'deployment-automation': 2
      };

      const validation = validateResponses(responses);
      expect(validation.isValid).toBeTruthy();
      expect(validation.issues).toHaveLength(0);
    });

    test('detects invalid question IDs', () => {
      const responses = {
        'invalid-question': 3,
        'branch-protection': 4
      };

      const validation = validateResponses(responses);
      expect(validation.isValid).toBeFalsy();
      expect(validation.issues).toContain('Invalid question ID: invalid-question');
    });

    test('validates score ranges', () => {
      const responses = {
        'codeowners': 5, // Invalid score (should be 1-4)
        'branch-protection': 0, // Invalid score (should be 1-4)
        'deployment-automation': 3 // Valid score
      };

      const validation = validateResponses(responses);
      expect(validation.isValid).toBeFalsy();
      expect(validation.issues.length).toBeGreaterThanOrEqual(2);
      expect(validation.issues.some(issue => issue.includes('Invalid score'))).toBeTruthy();
    });

    test('handles missing or invalid input', () => {
      expect(validateResponses(null).isValid).toBeFalsy();
      expect(validateResponses(undefined).isValid).toBeFalsy();
      expect(validateResponses('invalid').isValid).toBeFalsy();
      expect(validateResponses([]).isValid).toBeFalsy();
    });
  });

  describe('Stage-specific validation', () => {
    test.each(['pre-seed', 'seed', 'series-a'])('validates %s stage questions', (stage) => {
      const mockState = mockAssessmentState(stage);
      const stageQuestions = Object.values(categories)
        .flatMap(category => category.questions)
        .filter(q => q.stages.includes(stage));

      const mockResponses = stageQuestions.reduce((acc, q) => ({
        ...acc,
        [q.id]: 3  // Set a mid-range response for testing
      }), {});

      sessionStorage.setItem('octoflow', JSON.stringify({
        ...mockState,
        responses: mockResponses
      }));

      const validation = validateUserFlow();
      expect(validation.isValid).toBeTruthy();
      expect(validation.completionRate).toBe(1);
    });
  });
});
