import os from 'os';
import { redisStore } from './redisClient';
import { SystemMetrics } from '../types/performance';
import { logger } from './logger';

export class SystemMetricsCollector {
  private static instance: SystemMetricsCollector;
  private lastCpuUsage: { idle: number; total: number };
  private metricsCache: SystemMetrics | null = null;
  private lastUpdateTime = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds

  private constructor() {
    const cpus = os.cpus();
    this.lastCpuUsage = this.calculateCpuUsage(cpus);
  }

  static getInstance(): SystemMetricsCollector {
    if (!SystemMetricsCollector.instance) {
      SystemMetricsCollector.instance = new SystemMetricsCollector();
    }
    return SystemMetricsCollector.instance;
  }

  private calculateCpuUsage(cpus: os.CpuInfo[]): { idle: number; total: number } {
    const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const total = cpus.reduce(
      (acc, cpu) =>
        acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq,
      0
    );
    return { idle, total };
  }

  private async getRedisHealth(): Promise<{ connected: boolean; latency?: number }> {
    try {
      const startTime = Date.now();
      const isConnected = await redisStore.healthCheck();
      const latency = Date.now() - startTime;
      return { connected: isConnected, latency };
    } catch (error) {
      logger.error('Error checking Redis health:', error);
      return { connected: false };
    }
  }

  async getMetrics(): Promise<SystemMetrics> {
    const now = Date.now();
    if (this.metricsCache && now - this.lastUpdateTime < this.CACHE_TTL) {
      return this.metricsCache;
    }

    const cpus = os.cpus();
    const currentCpuUsage = this.calculateCpuUsage(cpus);
    
    const idleDiff = currentCpuUsage.idle - this.lastCpuUsage.idle;
    const totalDiff = currentCpuUsage.total - this.lastCpuUsage.total;
    const cpuUsagePercent = 100 - (100 * idleDiff / totalDiff);

    this.lastCpuUsage = currentCpuUsage;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const redisHealth = await this.getRedisHealth();

    this.metricsCache = {
      cpu: {
        loadAvg: os.loadavg(),
        usagePercent: cpuUsagePercent
      },
      memory: {
        total: totalMem,
        free: freeMem,
        usedPercent: (usedMem / totalMem) * 100
      },
      uptime: os.uptime(),
      redis: redisHealth
    };

    this.lastUpdateTime = now;
    return this.metricsCache;
  }
} 