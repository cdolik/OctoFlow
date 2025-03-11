export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export interface HealthStatus {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  system: {
    cpu: {
      loadAvg: number[];
      usagePercent: number;
    };
    memory: {
      total: number;
      free: number;
      usedPercent: number;
    };
    uptime: number;
    redis: {
      connected: boolean;
    };
    redisCircuitBreaker: {
      state: string;
      failures: number;
      fallbackCount: number;
    };
  };
  application: {
    metrics: {
      count: number;
      memoryTracking: boolean;
    };
    config: {
      sampleRate: number;
      slowThreshold: number;
    };
  };
}

export interface SystemMetrics {
  cpu: {
    loadAvg: number[];
    usagePercent: number;
  };
  memory: {
    total: number;
    free: number;
    usedPercent: number;
  };
  uptime: number;
  redis: {
    connected: boolean;
    latency?: number;
  };
}

export interface PerformanceConfig {
  thresholds: {
    render: number;
    memory: number;
    requests: number;
  };
  sampling: {
    rate: number;
    enabled: boolean;
  };
} 