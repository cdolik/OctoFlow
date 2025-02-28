import { ErrorBenchmark } from '../../utils/errorBenchmark';
import { ErrorAggregator } from '../../utils/errorAggregator';
import { errorScenarios, withErrorCleanup } from '../utils/errorTestUtils';

describe('Error Handling Stress Tests', () => {
  // Configure test timeouts and thresholds
  const CONCURRENT_OPERATIONS = 50;
  const OPERATION_TIMEOUT = 5000;
  const MAX_ACCEPTABLE_P95 = 1000; // 1 second

  describe('Storage Error Recovery Under Load', () => {
    it('handles concurrent storage operations', async () => {
      const benchmark = ErrorBenchmark.getInstance();
      const aggregator = new ErrorAggregator();

      // Run multiple storage operations concurrently
      const operations = Array(CONCURRENT_OPERATIONS).fill(null).map(async (_, i) => {
        return await withErrorCleanup(async () => {
          const success = await benchmark.measureRecoveryTime(
            'storage-stress',
            async () => {
              try {
                localStorage.setItem(`test-${i}`, 'x'.repeat(1024 * 10)); // 10KB per item
                return true;
              } catch (e) {
                if (e instanceof Error) {
                  aggregator.track(errorScenarios.storage.quotaExceeded());
                }
                return false;
              }
            }
          );

          expect(success).toBeDefined();
          return success;
        });
      });

      const results = await Promise.all(operations);
      const metrics = benchmark.getMetrics('storage-stress');
      
      expect(metrics?.p95).toBeLessThan(MAX_ACCEPTABLE_P95);
      expect(aggregator.getAggregates().length).toBeGreaterThan(0);
    }, OPERATION_TIMEOUT);
  });

  describe('Error Recovery Rate Limits', () => {
    it('maintains recovery rate limits under stress', async () => {
      const benchmark = ErrorBenchmark.getInstance();
      const startTime = Date.now();
      const RATE_LIMIT_WINDOW = 1000; // 1 second
      const MAX_RECOVERY_ATTEMPTS = 10;

      const operations = Array(CONCURRENT_OPERATIONS).fill(null).map(async (_, i) => {
        return await benchmark.measureRecoveryTime(
          'rate-limit-stress',
          async () => {
            // Simulate error recovery with rate limiting
            const currentTime = Date.now();
            const timeInWindow = currentTime - startTime;
            const attemptNumber = Math.floor(timeInWindow / RATE_LIMIT_WINDOW);

            if (attemptNumber >= MAX_RECOVERY_ATTEMPTS) {
              return false;
            }

            await new Promise(resolve => 
              setTimeout(resolve, Math.random() * 100)
            );
            return true;
          }
        );
      });

      const results = await Promise.all(operations);
      const successRate = results.filter(r => r).length / results.length;
      
      // Success rate should degrade gracefully under load
      expect(successRate).toBeLessThan(1);
      expect(successRate).toBeGreaterThan(0);
    }, OPERATION_TIMEOUT);
  });

  describe('Memory Usage Under Error Load', () => {
    it('maintains stable memory usage during error bursts', async () => {
      if (!global.gc) {
        console.warn('Garbage collection not exposed. Run with --expose-gc');
        return;
      }

      const initialMemory = process.memoryUsage();
      const aggregator = new ErrorAggregator();
      
      // Generate error burst
      for (let i = 0; i < 1000; i++) {
        aggregator.track(
          errorScenarios.storage.quotaExceeded(),
          { iteration: i }
        );
      }

      // Force garbage collection
      global.gc();
      
      const finalMemory = process.memoryUsage();
      const heapGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Heap should not grow significantly
      expect(heapGrowth).toBeLessThan(1024 * 1024 * 10); // 10MB
    }, OPERATION_TIMEOUT);
  });
});