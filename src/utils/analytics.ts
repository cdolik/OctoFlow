import { Stage } from '../types';

interface ErrorContext {
  componentStack?: string;
  source?: string;
  errorCount: number;
  recoveryAttempted?: boolean;
  recoverySuccessful?: boolean;
}

interface StageTransitionContext {
  from: Stage | null;
  to: Stage;
  timestamp: number;
  responses?: Record<string, number>;
  completionRate?: number;
  durationInPreviousStage?: number;
}

// ...existing logEvent and other utility functions...

export const trackStageTransition = (
  fromStage: Stage | null,
  toStage: Stage,
  context: Partial<StageTransitionContext> = {}
) => {
  const timestamp = Date.now();
  const baseContext = {
    from: fromStage,
    to: toStage,
    timestamp,
    responses: getAssessmentResponses(),
    completionRate: calculateCompletionRate(),
    durationInPreviousStage: fromStage ? calculateStageDuration(fromStage) : undefined
  };

  logEvent('stage_transition', {
    ...baseContext,
    ...context
  });
};

export const trackErrorWithRecovery = (
  error: Error,
  recoveryAttempted: boolean,
  recovered: boolean,
  context: Partial<ErrorContext> = {}
) => {
  const errorContext: ErrorContext = {
    componentStack: error.stack,
    source: error.name,
    errorCount: getErrorCount(),
    recoveryAttempted,
    recoverySuccessful: recovered,
    ...context
  };

  logEvent('error_with_recovery', {
    type: error.name,
    message: error.message,
    ...errorContext,
    sessionContext: getCurrentSessionContext(),
    timestamp: Date.now()
  });

  // Track as a separate error event for analytics aggregation
  logEvent('error', {
    type: error.name,
    recoverable: isRecoverableError(error),
    ...errorContext
  });
};

const calculateCompletionRate = (): number => {
  const responses = getAssessmentResponses();
  const metadata = getAssessmentMetadata();
  if (!metadata?.questionCount) return 0;
  return Object.keys(responses).length / metadata.questionCount;
};

const calculateStageDuration = (stage: Stage): number => {
  const metadata = getAssessmentMetadata();
  if (!metadata?.startTime) return 0;
  return Date.now() - metadata.startTime;
};

const isRecoverableError = (error: Error): boolean => {
  const unrecoverablePatterns = [
    /quota exceeded/i,
    /storage.*full/i,
    /permission denied/i
  ];
  return !unrecoverablePatterns.some(pattern => pattern.test(error.message));
};

// ...existing utility functions...