import { validateStorageState, validateStorageVersion, validateStateTransition } from './storageValidation';
import { AssessmentState, AssessmentResponse } from '../types/assessment';
import { Stage } from '../types';

describe('Storage Validation', () => {
  const validResponse: AssessmentResponse = {
    value: 3,
    timestamp: Date.now(),
    questionId: 'q1',
    category: 'github-ecosystem',
    timeSpent: 1000
  };

  const validState: AssessmentState = {
    stage: 'pre-seed',
    responses: {
      'q1': validResponse
    },
    progress: {
      questionIndex: 0,
      totalQuestions: 10,
      isComplete: false,
      lastUpdated: new Date().toISOString()
    },
    metadata: {
      startTime: Date.now(),
      lastInteraction: Date.now(),
      completedCategories: [],
      categoryScores: {}
    }
  };

  describe('validateStorageState', () => {
    it('validates correct state format', () => {
      const result = validateStorageState(validState);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects invalid stage values', () => {
      const invalidState = {
        ...validState,
        stage: 'invalid-stage'
      };

      const result = validateStorageState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid stage value');
    });

    it('validates response format', () => {
      const invalidResponse = {
        ...validResponse,
        value: 5 // Invalid score
      };

      const invalidState = {
        ...validState,
        responses: { 'q1': invalidResponse }
      };

      const result = validateStorageState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid response format for question q1');
    });

    it('validates progress format', () => {
      const invalidProgress = {
        ...validState.progress,
        questionIndex: 'not-a-number'
      };

      const invalidState = {
        ...validState,
        progress: invalidProgress
      };

      const result = validateStorageState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid question index');
    });

    it('validates metadata format', () => {
      const invalidMetadata = {
        ...validState.metadata,
        startTime: 'not-a-number'
      };

      const invalidState = {
        ...validState,
        metadata: invalidMetadata
      };

      const result = validateStorageState(invalidState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid start time');
    });
  });

  describe('validateStorageVersion', () => {
    it('validates correct version format', () => {
      expect(validateStorageVersion('1.0')).toBe(true);
      expect(validateStorageVersion('2.1')).toBe(true);
    });

    it('rejects invalid version formats', () => {
      expect(validateStorageVersion('1')).toBe(false);
      expect(validateStorageVersion('1.0.0')).toBe(false);
      expect(validateStorageVersion('invalid')).toBe(false);
    });
  });

  describe('validateStateTransition', () => {
    it('allows initial state creation', () => {
      const result = validateStateTransition(null, validState);
      expect(result.isValid).toBe(true);
    });

    it('validates stage progression', () => {
      const currentState: AssessmentState = {
        ...validState,
        stage: 'pre-seed'
      };

      const validNextState: AssessmentState = {
        ...validState,
        stage: 'seed'
      };

      const invalidNextState: AssessmentState = {
        ...validState,
        stage: 'series-a' // Skipping seed stage
      };

      expect(validateStateTransition(currentState, validNextState).isValid).toBe(true);
      expect(validateStateTransition(currentState, invalidNextState).isValid).toBe(false);
    });

    it('prevents response data loss', () => {
      const currentState: AssessmentState = {
        ...validState,
        responses: {
          'q1': validResponse,
          'q2': { ...validResponse, questionId: 'q2' }
        }
      };

      const newState: AssessmentState = {
        ...validState,
        responses: {
          'q1': validResponse // Missing q2 response
        }
      };

      const result = validateStateTransition(currentState, newState);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Response data would be lost in transition');
    });

    it('allows backwards stage navigation', () => {
      const currentState: AssessmentState = {
        ...validState,
        stage: 'series-a'
      };

      const newState: AssessmentState = {
        ...validState,
        stage: 'seed'
      };

      const result = validateStateTransition(currentState, newState);
      expect(result.isValid).toBe(true);
    });
  });
});