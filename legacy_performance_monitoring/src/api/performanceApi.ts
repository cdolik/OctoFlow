import express, { Request, Response, NextFunction } from 'express';
import { metricsStore } from '../utils/metricsStore';
import { logger } from '../utils/logger';
import { ComponentMetric, HealthStatus } from '../types/performance';

const router = express.Router();

// Basic API key validation middleware
const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.REACT_APP_API_KEY) {
    res.status(401).json({ success: false, error: 'Invalid API key' });
    return;
  }
  next();
};

// Basic request validation middleware
const validateMetricsInput = (req: Request, res: Response, next: NextFunction): void => {
  const { metrics } = req.body;
  if (!Array.isArray(metrics)) {
    res.status(400).json({ success: false, error: 'Invalid metrics format' });
    return;
  }
  next();
};

// Apply middleware
router.use(express.json({ limit: '10kb' }));
router.use(validateApiKey);

/**
 * Health check endpoint
 * @route GET /api/performance/health
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const isHealthy = await metricsStore.healthCheck();
    
    const healthStatus: HealthStatus = {
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      system: {
        cpu: {
          loadAvg: [0, 0, 0],
          usagePercent: 0
        },
        memory: {
          total: 0,
          free: 0,
          usedPercent: 0
        },
        uptime: process.uptime(),
        redis: {
          connected: true
        },
        redisCircuitBreaker: {
          state: 'closed',
          failures: 0,
          fallbackCount: 0
        }
      },
      application: {
        metrics: {
          count: (await metricsStore.getMetrics()).length,
          memoryTracking: true
        },
        config: {
          sampleRate: 1.0,
          slowThreshold: 16
        }
      }
    };

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ 
      success: false, 
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get all performance metrics
 * @route GET /api/performance/metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await metricsStore.getMetrics();
    res.json({ 
      success: true, 
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

interface MetricsRequestBody {
  metrics: ComponentMetric[];
}

/**
 * Save performance metrics
 * @route POST /api/performance/metrics
 */
router.post('/metrics', validateMetricsInput, async (req: Request<{}, {}, MetricsRequestBody>, res: Response) => {
  try {
    await metricsStore.saveMetrics(req.body.metrics);
    res.json({ success: true, message: 'Metrics saved successfully' });
  } catch (error) {
    logger.error('Failed to save metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to save metrics' });
  }
});

/**
 * Clear all metrics (useful for testing)
 * @route POST /api/performance/clear
 */
router.post('/clear', async (_req: Request, res: Response) => {
  try {
    await metricsStore.clearMetrics();
    res.json({ success: true, message: 'Metrics cleared' });
  } catch (error) {
    logger.error('Failed to clear metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to clear metrics' });
  }
});

export default router; 