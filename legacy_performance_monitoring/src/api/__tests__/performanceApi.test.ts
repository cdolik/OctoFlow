import request from 'supertest';
import express from 'express';
import performanceRouter from '../performanceApi';
import { metricsStore } from '../../utils/metricsStore';

const app = express();
app.use(express.json());
app.use('/api/performance', performanceRouter);

describe('Performance API', () => {
  const API_KEY = 'test-api-key';
  process.env.REACT_APP_API_KEY = API_KEY;

  beforeEach(async () => {
    await metricsStore.clearMetrics();
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .get('/api/performance/health');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get('/api/performance/health')
        .set('x-api-key', 'invalid-key');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/performance/health')
        .set('x-api-key', API_KEY);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.system).toBeDefined();
      expect(response.body.application).toBeDefined();
    });
  });

  describe('Metrics Management', () => {
    const testMetrics = [{
      componentName: 'TestComponent',
      renderTime: 100,
      timestamp: Date.now()
    }];

    it('should save and retrieve metrics', async () => {
      // Save metrics
      const saveResponse = await request(app)
        .post('/api/performance/metrics')
        .set('x-api-key', API_KEY)
        .send({ metrics: testMetrics });
      
      expect(saveResponse.status).toBe(200);
      expect(saveResponse.body.success).toBe(true);

      // Retrieve metrics
      const getResponse = await request(app)
        .get('/api/performance/metrics')
        .set('x-api-key', API_KEY);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data).toHaveLength(1);
      expect(getResponse.body.data[0]).toMatchObject(testMetrics[0]);
    });

    it('should reject invalid metrics format', async () => {
      const response = await request(app)
        .post('/api/performance/metrics')
        .set('x-api-key', API_KEY)
        .send({ metrics: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should clear metrics', async () => {
      // First save some metrics
      await request(app)
        .post('/api/performance/metrics')
        .set('x-api-key', API_KEY)
        .send({ metrics: testMetrics });

      // Clear metrics
      const clearResponse = await request(app)
        .post('/api/performance/clear')
        .set('x-api-key', API_KEY);
      
      expect(clearResponse.status).toBe(200);
      expect(clearResponse.body.success).toBe(true);

      // Verify metrics are cleared
      const getResponse = await request(app)
        .get('/api/performance/metrics')
        .set('x-api-key', API_KEY);
      
      expect(getResponse.body.data).toHaveLength(0);
    });
  });
}); 