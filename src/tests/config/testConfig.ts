import fc from 'fast-check';

// Configure test timeouts and retry settings
export const TEST_CONFIG = {
  propertyBased: {
    numRuns: process.env.NODE_ENV === 'CI' ? 100 : 50,
    timeout: 5000,
    skipAfter: 2000 // Skip long-running tests after 2s in development
  },
  stress: {
    concurrent: 50,
    operationTimeout: 5000,
    maxAcceptableLatencyP95: 1000, // 1 second
    retryAttempts: 3
  },
  errorAggregation: {
    maxStoredErrors: 1000,
    aggregationWindow: 24 * 60 * 60 * 1000, // 24 hours
    samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  }
};

// Property-based testing configuration
export const fc_config: fc.Parameters<unknown> = {
  numRuns: TEST_CONFIG.propertyBased.numRuns,
  timeout: TEST_CONFIG.propertyBased.timeout,
  skipAllAfterTimeLimit: TEST_CONFIG.propertyBased.skipAfter,
  interruptAfterTimeLimit: TEST_CONFIG.propertyBased.timeout * 2
};

// Custom arbitraries for error testing
export const arbitraries = {
  errorType: fc.constantFrom('storage', 'network', 'validation', 'state', 'critical'),
  severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
  errorContext: fc.record({
    component: fc.string(),
    action: fc.string(),
    timestamp: fc.date().map(d => d.toISOString()),
    metadata: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer()))
  }),
  errorResponse: fc.record({
    success: fc.boolean(),
    attempts: fc.integer(1, 5),
    duration: fc.integer(0, 2000)
  })
};