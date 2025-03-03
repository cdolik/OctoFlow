import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

// Constants for security configuration
const MAX_REQUEST_SIZE = '10kb';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // requests per window

// Helmet middleware with custom CSP
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.REACT_APP_API_BASE_URL || ''],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
});

// CORS configuration
export const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  maxAge: 86400, // 24 hours
});

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Constant-time API key validation
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.REACT_APP_API_KEY;

  if (process.env.NODE_ENV === 'production') {
    if (!apiKey || typeof apiKey !== 'string' || !validApiKey) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    try {
      const keyBuffer = Buffer.from(apiKey);
      const validKeyBuffer = Buffer.from(validApiKey);

      if (
        keyBuffer.length !== validKeyBuffer.length ||
        !crypto.timingSafeEqual(keyBuffer, validKeyBuffer)
      ) {
        return res.status(401).json({ success: false, error: 'Invalid API key' });
      }
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid API key format' });
    }
  }
  next();
};

// Input validation rules
export const validateMetricsInput = [
  body('sampleRate').optional().isFloat({ min: 0, max: 1 }),
  body('slowThreshold').optional().isInt({ min: 0 }),
  body('enableMemoryTracking').optional().isBoolean(),
  body('enableInteractionTracking').optional().isBoolean(),
  body('maxMetrics').optional().isInt({ min: 1 }),
];

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid input',
      details: errors.array() 
    });
  }
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Remove any potential XSS or injection patterns
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/data:/gi, '') // Remove data: protocol
          .trim();
      }
    });
  }
  next();
}; 