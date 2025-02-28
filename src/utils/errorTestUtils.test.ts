import { ErrorTestRunner, createTestError, createTestScenarios } from './errorTestUtils';
import { AssessmentError } from '../types/errors';
import { errorAnalytics } from './errorAnalytics';
import { errorRecovery } from './errorRecovery';

jest.mock('./errorAnalytics');
jest.mock('./errorRecovery');

describe('ErrorTestUtils', () => {
  describe('ErrorTestRunner', () => {
    let runner: ErrorTestRunner;

    beforeEach(() => {
      runner = new ErrorTestRunner();
      jest.clearAllMocks();
    });

    it('runs all scenarios and tracks results', async () => {
      const scenarios = createTestScenarios();
      scenarios.forEach(scenario => runner.addScenario(scenario));

      const results = await runner.runAll();
      expect(results.size).toBe(scenarios.length);
    });

    it('handles failed scenarios', async () => {
      const failingScenario = {
        name: 'Always fails',
        error: new Error('Test error'),
        expectedRecovery: true,
        setup: jest.fn().mockRejectedValue(new Error('Setup failed'))
      };

      runner.addScenario(failingScenario);
      const results = await runner.runAll();

      expect(results.get('Always fails')).toBe(false);
      expect(runner.getFailedScenarios()).toContain('Always fails');
    });

    it('calculates success rate correctly', async () => {
      const scenarios = [
        {
          name: 'Success 1',
          error: new Error('Test 1'),
          expectedRecovery: true
        },
        {
          name: 'Success 2',
          error: new Error('Test 2'),
          expectedRecovery: false
        },
        {
          name: 'Failure',
          error: new Error('Test 3'),
          expectedRecovery: true,
          setup: jest.fn().mockRejectedValue(new Error('Failed'))
        }
      ];

      scenarios.forEach(scenario => runner.addScenario(scenario));
      await runner.runAll();

      expect(runner.getSuccessRate()).toBe(66.66666666666667);
    });

    it('executes setup and cleanup functions', async () => {
      const setup = jest.fn();
      const cleanup = jest.fn();

      const scenario = {
        name: 'Test setup/cleanup',
        error: new Error('Test'),
        expectedRecovery: true,
        setup,
        cleanup
      };

      runner.addScenario(scenario);
      await runner.runAll();

      expect(setup).toHaveBeenCalled();
      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe('createTestError', () => {
    it('creates AssessmentError with default values', () => {
      const error = createTestError('Test message');

      expect(error).toBeInstanceOf(AssessmentError);
      expect(error.message).toBe('Test message');
      expect(error.severity).toBe('medium');
      expect(error.recoverable).toBe(true);
    });

    it('allows custom severity and recoverability', () => {
      const error = createTestError('Test message', 'critical', false);

      expect(error.severity).toBe('critical');
      expect(error.recoverable).toBe(false);
    });

    it('includes context in created error', () => {
      const error = createTestError('Test message');

      expect(error.context).toEqual(expect.objectContaining({
        component: 'ErrorTest',
        action: 'test'
      }));
      expect(error.context.timestamp).toBeDefined();
    });
  });

  describe('createTestScenarios', () => {
    it('creates default test scenarios', () => {
      const scenarios = createTestScenarios();

      expect(scenarios).toHaveLength(3);
      expect(scenarios[0].name).toBe('Network Error Recovery');
      expect(scenarios[1].name).toBe('Storage Error Recovery');
      expect(scenarios[2].name).toBe('Critical Error No Recovery');
    });

    it('includes setup for network scenarios', () => {
      const scenarios = createTestScenarios();
      const networkScenario = scenarios.find(s => s.name === 'Network Error Recovery');

      expect(networkScenario?.setup).toBeDefined();
      expect(networkScenario?.cleanup).toBeDefined();
    });

    it('includes appropriate error types and recovery expectations', () => {
      const scenarios = createTestScenarios();

      scenarios.forEach(scenario => {
        expect(scenario.error).toBeInstanceOf(AssessmentError);
        expect(typeof scenario.expectedRecovery).toBe('boolean');
      });
    });
  });
});