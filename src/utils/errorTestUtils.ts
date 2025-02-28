import { AssessmentError, ErrorContext, ErrorSeverity } from '../types/errors';
import { errorRecovery } from './errorRecovery';
import { errorAnalytics } from './errorAnalytics';

interface ErrorScenario {
  name: string;
  error: Error;
  context?: ErrorContext;
  expectedRecovery: boolean;
  setup?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

export class ErrorTestRunner {
  private scenarios: ErrorScenario[] = [];
  private results: Map<string, boolean> = new Map();

  addScenario(scenario: ErrorScenario): void {
    this.scenarios.push(scenario);
  }

  async runAll(): Promise<Map<string, boolean>> {
    for (const scenario of this.scenarios) {
      try {
        if (scenario.setup) {
          await scenario.setup();
        }

        const recovered = await errorRecovery.attemptRecovery(
          scenario.error,
          scenario.context || {
            component: 'ErrorTest',
            action: scenario.name,
            timestamp: new Date().toISOString()
          }
        );

        this.results.set(
          scenario.name,
          recovered === scenario.expectedRecovery
        );

        if (scenario.cleanup) {
          await scenario.cleanup();
        }
      } catch (error) {
        this.results.set(scenario.name, false);
        console.error(`Scenario "${scenario.name}" failed:`, error);
      }
    }

    return this.results;
  }

  getFailedScenarios(): string[] {
    return Array.from(this.results.entries())
      .filter(([, passed]) => !passed)
      .map(([name]) => name);
  }

  getSuccessRate(): number {
    const total = this.results.size;
    if (total === 0) return 0;

    const passed = Array.from(this.results.values())
      .filter(result => result).length;

    return (passed / total) * 100;
  }
}

export function createTestError(
  message: string,
  severity: ErrorSeverity = 'medium',
  recoverable = true
): AssessmentError {
  return new AssessmentError(message, {
    context: {
      component: 'ErrorTest',
      action: 'test',
      timestamp: new Date().toISOString()
    },
    severity,
    recoverable
  });
}

export function mockErrorAnalytics(): void {
  jest.spyOn(errorAnalytics, 'trackError').mockImplementation();
}

export function createTestScenarios(): ErrorScenario[] {
  return [
    {
      name: 'Network Error Recovery',
      error: new AssessmentError('Network connection failed', {
        severity: 'medium',
        recoverable: true
      }),
      expectedRecovery: true,
      async setup() {
        // Simulate offline state
        Object.defineProperty(navigator, 'onLine', {
          value: false,
          writable: true
        });
      },
      async cleanup() {
        Object.defineProperty(navigator, 'onLine', {
          value: true,
          writable: true
        });
      }
    },
    {
      name: 'Storage Error Recovery',
      error: new AssessmentError('Storage quota exceeded', {
        severity: 'high',
        recoverable: true
      }),
      expectedRecovery: true
    },
    {
      name: 'Critical Error No Recovery',
      error: new AssessmentError('Critical system failure', {
        severity: 'critical',
        recoverable: false
      }),
      expectedRecovery: false
    }
  ];
}