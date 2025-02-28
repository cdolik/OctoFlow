import { AssessmentError, ErrorContext, ErrorSeverity } from '../../types/errors';

type ErrorScenarioType = 'storage' | 'network' | 'validation' | 'state' | 'critical';

interface ErrorScenarioConfig {
  type: ErrorScenarioType;
  message?: string;
  severity?: ErrorSeverity;
  recoverable?: boolean;
  context?: Partial<ErrorContext>;
}

class ErrorScenarioFactory {
  private static readonly scenarios: Record<ErrorScenarioType, ErrorScenarioConfig> = {
    storage: {
      type: 'storage',
      message: 'Storage operation failed',
      severity: 'high',
      recoverable: true,
      context: { component: 'Storage', action: 'write' }
    },
    network: {
      type: 'network',
      message: 'Network request failed',
      severity: 'medium',
      recoverable: true,
      context: { component: 'NetworkClient', action: 'fetch' }
    },
    validation: {
      type: 'validation',
      message: 'Validation failed',
      severity: 'low',
      recoverable: true,
      context: { component: 'Validator', action: 'validate' }
    },
    state: {
      type: 'state',
      message: 'Invalid state transition',
      severity: 'medium',
      recoverable: true,
      context: { component: 'StateManager', action: 'transition' }
    },
    critical: {
      type: 'critical',
      message: 'Critical system error',
      severity: 'critical',
      recoverable: false,
      context: { component: 'System', action: 'core' }
    }
  };

  static create(config: ErrorScenarioConfig): AssessmentError {
    const baseScenario = this.scenarios[config.type];
    const finalConfig = {
      ...baseScenario,
      ...config,
      context: {
        ...baseScenario.context,
        ...config.context,
        timestamp: new Date().toISOString()
      }
    };

    const error = new AssessmentError(
      finalConfig.message ?? baseScenario.message,
      {
        severity: finalConfig.severity ?? baseScenario.severity,
        recoverable: finalConfig.recoverable ?? baseScenario.recoverable,
        context: finalConfig.context
      }
    );

    return error;
  }

  static storage(overrides?: Partial<ErrorScenarioConfig>): AssessmentError {
    return this.create({ type: 'storage', ...overrides });
  }

  static network(overrides?: Partial<ErrorScenarioConfig>): AssessmentError {
    return this.create({ type: 'network', ...overrides });
  }

  static validation(overrides?: Partial<ErrorScenarioConfig>): AssessmentError {
    return this.create({ type: 'validation', ...overrides });
  }

  static state(overrides?: Partial<ErrorScenarioConfig>): AssessmentError {
    return this.create({ type: 'state', ...overrides });
  }

  static critical(overrides?: Partial<ErrorScenarioConfig>): AssessmentError {
    return this.create({ type: 'critical', ...overrides });
  }
}