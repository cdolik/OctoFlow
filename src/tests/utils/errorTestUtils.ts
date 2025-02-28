import { AssessmentError, ErrorContext } from '../../types/errors';
import { Stage } from '../../types';

interface ErrorFixture {
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  stage?: Stage;
  metadata?: Record<string, unknown>;
}

export const createErrorFixture = ({
  message,
  severity = 'medium',
  recoverable = true,
  stage,
  metadata
}: ErrorFixture): AssessmentError => {
  const error = new AssessmentError(message);
  error.severity = severity;
  error.recoverable = recoverable;
  error.context = {
    stage,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  return error;
};

export const errorScenarios = {
  storage: {
    quotaExceeded: () => createErrorFixture({
      message: 'Storage quota exceeded',
      severity: 'high',
      recoverable: true,
      metadata: { storageType: 'localStorage' }
    }),
    corrupted: () => createErrorFixture({
      message: 'Storage data corrupted',
      severity: 'high',
      recoverable: true,
      metadata: { operation: 'read' }
    })
  },
  network: {
    offline: () => createErrorFixture({
      message: 'Network connection lost',
      severity: 'medium',
      recoverable: true
    }),
    timeout: () => createErrorFixture({
      message: 'Network request timeout',
      severity: 'medium',
      recoverable: true
    })
  },
  validation: {
    invalidState: (stage: Stage) => createErrorFixture({
      message: 'Invalid state transition',
      severity: 'medium',
      recoverable: true,
      stage,
      metadata: { transition: 'stateChange' }
    })
  }
};

export const withErrorCleanup = async (fn: () => Promise<void>): Promise<void> => {
  try {
    await fn();
  } finally {
    // Reset mocks and clear storage
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();
  }
};