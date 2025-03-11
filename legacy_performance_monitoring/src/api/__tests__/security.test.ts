import request from 'supertest';
import express from 'express';
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
  validateApiKey,
  validateMetricsInput,
  validateInput,
  sanitizeRequest
} from '../middleware/security';

const app = express();
app.use(express.json());
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(validateApiKey);
app.use(sanitizeRequest);

// Test endpoint
app.post('/test', validateMetricsInput, validateInput, (req, res) => {
  res.json({ success: true, data: req.body });
});

describe('Security Middleware', () => {
  const validApiKey = 'test-api-key';
  
  beforeEach(() => {
    process.env.REACT_APP_API_KEY = validApiKey;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    delete process.env.REACT_APP_API_KEY;
    process.env.NODE_ENV = 'test';
  });

  describe('API Key Validation', () => {
    it('should reject requests without API key in production', async () => {
      const response = await request(app).post('/test');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should accept requests with valid API key', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ sampleRate: 0.5 });
      expect(response.status).toBe(200);
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', 'invalid-key')
        .send({ sampleRate: 0.5 });
      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('should validate sampleRate range', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ sampleRate: 2 }); // Invalid: > 1
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate slowThreshold as positive integer', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ slowThreshold: -1 }); // Invalid: negative
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept valid configuration', async () => {
      const validConfig = {
        sampleRate: 0.5,
        slowThreshold: 100,
        enableMemoryTracking: true,
        enableInteractionTracking: false,
        maxMetrics: 1000
      };

      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send(validConfig);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Request Sanitization', () => {
    it('should sanitize HTML in request body', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ 
          name: '<script>alert("xss")</script>test'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('test');
    });

    it('should remove javascript: protocol', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ 
          url: 'javascript:alert(1)'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.url).toBe('alert(1)');
    });

    it('should handle nested objects', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ 
          config: {
            name: '<script>alert("xss")</script>test'
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.config.name).toBe('test');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const response = await request(app)
        .post('/test')
        .set('x-api-key', validApiKey)
        .send({ sampleRate: 0.5 });
      expect(response.status).toBe(200);
    });

    it('should block excessive requests', async () => {
      // Make 101 requests (exceeding the 100 limit)
      for (let i = 0; i < 101; i++) {
        const response = await request(app)
          .post('/test')
          .set('x-api-key', validApiKey)
          .send({ sampleRate: 0.5 });
        
        if (i === 100) {
          expect(response.status).toBe(429); // Too Many Requests
          expect(response.body.success).toBe(false);
        }
      }
    });
  });

  describe('CORS', () => {
    it('should allow requests from allowed origins', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
      
      const response = await request(app)
        .post('/test')
        .set('Origin', 'http://localhost:3000')
        .set('x-api-key', validApiKey)
        .send({ sampleRate: 0.5 });
      
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should block requests from unauthorized origins', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
      
      const response = await request(app)
        .post('/test')
        .set('Origin', 'http://evil.com')
        .set('x-api-key', validApiKey)
        .send({ sampleRate: 0.5 });
      
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
}); 