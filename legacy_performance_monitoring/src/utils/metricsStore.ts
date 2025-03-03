import { ComponentMetric } from '../types/performance';
import { logger } from './logger';

export class InMemoryMetricsStore {
  private static instance: InMemoryMetricsStore;
  private metrics: ComponentMetric[] = [];
  private readonly MAX_METRICS = 1000;

  private constructor() {}

  static getInstance(): InMemoryMetricsStore {
    if (!InMemoryMetricsStore.instance) {
      InMemoryMetricsStore.instance = new InMemoryMetricsStore();
    }
    return InMemoryMetricsStore.instance;
  }

  async saveMetrics(newMetrics: ComponentMetric[]): Promise<void> {
    try {
      // Add new metrics and maintain max size
      this.metrics = [...newMetrics, ...this.metrics]
        .slice(0, this.MAX_METRICS);
      
      logger.info(`Saved ${newMetrics.length} metrics. Total count: ${this.metrics.length}`);
    } catch (error) {
      logger.error('Error saving metrics:', error);
      throw error;
    }
  }

  async getMetrics(): Promise<ComponentMetric[]> {
    return this.metrics;
  }

  async clearMetrics(): Promise<void> {
    this.metrics = [];
    logger.info('Cleared all metrics');
  }

  async healthCheck(): Promise<boolean> {
    return true; // Always healthy for in-memory store
  }
}

export const metricsStore = InMemoryMetricsStore.getInstance(); 