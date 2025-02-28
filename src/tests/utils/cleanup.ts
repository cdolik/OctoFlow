import { ErrorBenchmark } from '../../utils/errorBenchmark';
import { ErrorAggregator } from '../../utils/errorAggregator';

interface CleanupContext {
  storage?: boolean;
  mocks?: boolean;
  errorMetrics?: boolean;
}

export const cleanupAfterTest = async (context: CleanupContext = {
  storage: true,
  mocks: true,
  errorMetrics: true
}) => {
  const cleanupTasks: Promise<void>[] = [];

  if (context.storage) {
    cleanupTasks.push(
      (async () => {
        sessionStorage.clear();
        localStorage.clear();
      })()
    );
  }

  if (context.mocks) {
    cleanupTasks.push(
      (async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
      })()
    );
  }

  if (context.errorMetrics) {
    cleanupTasks.push(
      (async () => {
        // Clear error metrics
        ErrorBenchmark.getInstance().clearOldResults(0);
        const aggregator = new ErrorAggregator();
        localStorage.removeItem(ErrorAggregator['STORAGE_KEY']);
      })()
    );
  }

  await Promise.all(cleanupTasks);
};

export const withCleanup = (fn: () => Promise<void>, context?: CleanupContext) => {
  return async () => {
    try {
      await fn();
    } finally {
      await cleanupAfterTest(context);
    }
  };
};