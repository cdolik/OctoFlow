/**
 * Performance Monitoring Configuration
 * 
 * This file contains standardized thresholds and logging configuration for the performance monitoring system.
 * 
 * Thresholds:
 * - stateLoad: Time to load state from storage (100ms)
 * - stateSave: Time to save state to storage (50ms)
 * - render: Target frame time for React components (16ms)
 * - calculation: Time for complex calculations (50ms)
 * 
 * Logging Configuration:
 * - enabled: Only in development mode
 * - prefix: Standard prefix for all logs
 * - includeTimestamp: ISO timestamp for each log
 * - includeInstanceId: Component instance identifier
 * 
 * Example log format:
 * [Performance] 2024-03-20T10:30:45.123Z ComponentName[instance-1] - Operation: 45.67ms
 */

export const PERFORMANCE_CONFIG = {
  thresholds: {
    stateLoad: 100,    // Maximum acceptable time to load state (ms)
    stateSave: 50,     // Maximum acceptable time to save state (ms)
    render: 16,        // React's target frame time (1/60 fps)
    calculation: 50    // Maximum time for complex calculations (ms)
  },
  logging: {
    enabled: process.env.NODE_ENV === 'development',
    prefix: '[Performance]',
    includeTimestamp: true,
    includeInstanceId: true
  }
} as const;

/**
 * Formats a performance log message with consistent structure
 * @param component - Name of the component being monitored
 * @param operation - Type of operation being measured
 * @param duration - Duration of the operation in milliseconds
 * @param instanceId - Optional unique identifier for component instance
 * @returns Formatted log message
 * 
 * Example output:
 * [Performance] 2024-03-20T10:30:45.123Z MyComponent[abc123] - RenderTime: 45.67ms
 */
export const formatPerformanceLog = (
  component: string,
  operation: string,
  duration: number,
  instanceId?: string
): string => {
  const timestamp = new Date().toISOString();
  const instanceStr = instanceId ? `[${instanceId}]` : '';
  return `${PERFORMANCE_CONFIG.logging.prefix} ${timestamp} ${component}${instanceStr} - ${operation}: ${duration.toFixed(2)}ms`;
}; 