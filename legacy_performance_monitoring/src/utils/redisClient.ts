import Redis from 'ioredis';
import { ComponentMetric } from '../types/performance';
import CircuitBreaker from 'opossum';
import { logger } from './logger';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  tls?: {
    enabled: boolean;
    rejectUnauthorized: boolean;
  };
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  maxMetricsPerBatch?: number;
  circuitBreaker?: {
    timeout?: number;
    errorThreshold?: number;
    resetTimeout?: number;
  };
}

export class RedisMetricsStore {
  private client: Redis.Cluster | Redis;
  private static instance: RedisMetricsStore;
  private readonly METRICS_KEY = 'performance:metrics';
  private readonly METRICS_EXPIRY = 60 * 60 * 24; // 24 hours
  private readonly BATCH_SIZE: number;
  private metricsBuffer: ComponentMetric[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    const config: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      tls: {
        enabled: process.env.REDIS_TLS_ENABLED === 'true',
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      maxMetricsPerBatch: 100,
      circuitBreaker: {
        timeout: 3000,
        errorThreshold: 50,
        resetTimeout: 30000
      }
    };

    if (process.env.REDIS_CLUSTER_ENABLED === 'true') {
      this.client = new Redis.Cluster(
        [{ host: config.host, port: config.port }],
        {
          redisOptions: {
            password: config.password,
            tls: config.tls?.enabled ? {
              rejectUnauthorized: config.tls.rejectUnauthorized
            } : undefined,
            maxRetriesPerRequest: config.maxRetriesPerRequest,
            enableReadyCheck: config.enableReadyCheck
          },
          clusterRetryStrategy: (times: number) => {
            const delay = Math.min(times * 100, 2000);
            return delay;
          }
        }
      );
    } else {
      this.client = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        tls: config.tls?.enabled ? {
          rejectUnauthorized: config.tls.rejectUnauthorized
        } : undefined,
        maxRetriesPerRequest: config.maxRetriesPerRequest,
        enableReadyCheck: config.enableReadyCheck,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });
    }

    this.BATCH_SIZE = config.maxMetricsPerBatch || 100;

    this.circuitBreaker = new CircuitBreaker(
      async (operation: () => Promise<any>) => operation(),
      {
        timeout: config.circuitBreaker?.timeout,
        errorThresholdPercentage: config.circuitBreaker?.errorThreshold,
        resetTimeout: config.circuitBreaker?.resetTimeout
      }
    );

    this.client.on('error', (error) => {
      logger.error('Redis Client Error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  static getInstance(): RedisMetricsStore {
    if (!RedisMetricsStore.instance) {
      RedisMetricsStore.instance = new RedisMetricsStore();
    }
    return RedisMetricsStore.instance;
  }

  private async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return this.circuitBreaker.fire(operation);
  }

  async saveMetrics(metrics: ComponentMetric[]): Promise<void> {
    this.metricsBuffer.push(...metrics);

    if (this.metricsBuffer.length >= this.BATCH_SIZE) {
      await this.flushMetrics();
    } else if (!this.flushTimeout) {
      // Schedule a flush if not already scheduled
      this.flushTimeout = setTimeout(() => this.flushMetrics(), 1000);
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = this.metricsBuffer.splice(0, this.BATCH_SIZE);
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    try {
      await this.executeWithCircuitBreaker(async () => {
        const pipeline = this.client.pipeline();
        
        // Store metrics with expiry
        pipeline.setex(
          this.METRICS_KEY,
          this.METRICS_EXPIRY,
          JSON.stringify(metricsToFlush)
        );

        // Store timestamp for backup tracking
        pipeline.set(
          `${this.METRICS_KEY}:last_update`,
          Date.now().toString()
        );

        await pipeline.exec();
      });
    } catch (error) {
      logger.error('Error flushing metrics to Redis:', error);
      // Re-add failed metrics to the buffer
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  async getMetrics(): Promise<ComponentMetric[]> {
    try {
      return await this.executeWithCircuitBreaker(async () => {
        const data = await this.client.get(this.METRICS_KEY);
        return data ? JSON.parse(data) : [];
      });
    } catch (error) {
      logger.error('Error retrieving metrics from Redis:', error);
      return [];
    }
  }

  async clearMetrics(): Promise<void> {
    try {
      await this.executeWithCircuitBreaker(async () => {
        const pipeline = this.client.pipeline();
        pipeline.del(this.METRICS_KEY);
        pipeline.del(`${this.METRICS_KEY}:last_update`);
        await pipeline.exec();
      });
    } catch (error) {
      logger.error('Error clearing metrics from Redis:', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.executeWithCircuitBreaker(async () => {
        await this.client.ping();
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCircuitBreakerStatus(): Promise<{
    state: string;
    failures: number;
    fallbackCount: number;
  }> {
    return {
      state: this.circuitBreaker.opened ? 'open' : 'closed',
      failures: this.circuitBreaker.stats.failures,
      fallbackCount: this.circuitBreaker.stats.fallbacks
    };
  }

  private async shutdown(): Promise<void> {
    try {
      // Flush any remaining metrics
      await this.flushMetrics();
      // Close Redis connection
      await this.client.quit();
    } catch (error) {
      logger.error('Error during Redis shutdown:', error);
      process.exit(1);
    }
  }
}

export const redisStore = RedisMetricsStore.getInstance(); 