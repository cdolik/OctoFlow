import fc from 'fast-check';
import { AssessmentError } from '../../types/errors';
import { ErrorAggregator } from '../../utils/errorAggregator';
import { ErrorBenchmark } from '../../utils/errorBenchmark';

// Arbitrary generators for property testing
const errorArbitrary = fc.record({
  message: fc.string(),
  severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
  recoverable: fc.boolean(),
  stage: fc.constantFrom('pre-seed', 'seed', 'series-a'),
  metadata: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer()))
});

describe('Error Handling Properties', () => {
  describe('Error Aggregation Properties', () => {
    it('should maintain error count invariants', () => {
      const aggregator = new ErrorAggregator();
      
      fc.assert(
        fc.property(fc.array(errorArbitrary), errors => {
          // Track all generated errors
          errors.forEach(e => {
            const error = new AssessmentError(e.message);
            error.severity = e.severity;
            error.recoverable = e.recoverable;
            aggregator.track(error, { stage: e.stage, ...e.metadata });
          });

          const aggregates = aggregator.getAggregates();
          
          // Properties that should hold true
          return (
            // Count should match tracked errors for same signature
            aggregates.every(agg => 
              agg.metrics.count === errors.filter(e => 
                `${e.severity}:${e.message}` === agg.signature.split(':').slice(1).join(':')
              ).length
            ) &&
            // Recovery attempts should never exceed error count
            aggregates.every(agg => 
              agg.metrics.recoveryAttempts <= agg.metrics.count
            ) &&
            // Success count should never exceed attempts
            aggregates.every(agg =>
              agg.metrics.recoverySuccess <= agg.metrics.recoveryAttempts
            )
          );
        })
      );
    });
  });

  describe('Error Recovery Properties', () => {
    it('should maintain recovery timing invariants', () => {
      const benchmark = ErrorBenchmark.getInstance();
      
      fc.assert(
        fc.property(
          fc.array(fc.tuple(
            errorArbitrary,
            fc.integer(0, 1000) // Simulated recovery time
          )),
          async errorTimings => {
            for (const [error, timing] of errorTimings) {
              await benchmark.measureRecoveryTime(
                'test-recovery',
                async () => {
                  await new Promise(resolve => setTimeout(resolve, timing));
                  return true;
                },
                { stage: error.stage }
              );
            }

            const metrics = benchmark.getMetrics('test-recovery');
            if (!metrics || errorTimings.length === 0) return true;

            return (
              // Min should be smallest timing
              metrics.min <= Math.min(...errorTimings.map(([, t]) => t)) &&
              // Max should be largest timing
              metrics.max >= Math.max(...errorTimings.map(([, t]) => t)) &&
              // Average should be between min and max
              metrics.avg >= metrics.min &&
              metrics.avg <= metrics.max &&
              // P95 should be between avg and max
              metrics.p95 >= metrics.avg &&
              metrics.p95 <= metrics.max
            );
          }
        )
      );
    });
  });
});