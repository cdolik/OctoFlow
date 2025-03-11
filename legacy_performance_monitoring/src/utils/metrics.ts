import client from 'prom-client';
import { SystemMetricsCollector } from './systemMetrics';
import { redisStore } from './redisClient';

// Create a Registry
const register = new client.Registry();

// Add default metrics (e.g., Node.js metrics)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const componentRenderDuration = new client.Histogram({
  name: 'component_render_duration_seconds',
  help: 'Duration of component renders in seconds',
  labelNames: ['component'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

const redisOperationDuration = new client.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

const systemMetricsGauge = new client.Gauge({
  name: 'system_metrics',
  help: 'System metrics',
  labelNames: ['metric'],
});

const redisHealthGauge = new client.Gauge({
  name: 'redis_health',
  help: 'Redis health status (1 = healthy, 0 = unhealthy)',
});

const redisCircuitBreakerGauge = new client.Gauge({
  name: 'redis_circuit_breaker_status',
  help: 'Redis circuit breaker status (1 = open, 0 = closed)',
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(componentRenderDuration);
register.registerMetric(redisOperationDuration);
register.registerMetric(systemMetricsGauge);
register.registerMetric(redisHealthGauge);
register.registerMetric(redisCircuitBreakerGauge);

// Update system metrics every 15 seconds
setInterval(async () => {
  try {
    const metrics = await SystemMetricsCollector.getInstance().getMetrics();
    const redisStatus = await redisStore.getCircuitBreakerStatus();

    systemMetricsGauge.set({ metric: 'cpu_usage' }, metrics.cpu.usagePercent);
    systemMetricsGauge.set({ metric: 'memory_usage' }, metrics.memory.usedPercent);
    
    redisHealthGauge.set(metrics.redis.connected ? 1 : 0);
    redisCircuitBreakerGauge.set(redisStatus.state === 'open' ? 1 : 0);
  } catch (error) {
    console.error('Error updating system metrics:', error);
  }
}, 15000);

export const metrics = {
  register,
  httpRequestDurationMicroseconds,
  componentRenderDuration,
  redisOperationDuration,
  systemMetricsGauge,
  redisHealthGauge,
  redisCircuitBreakerGauge,
}; 