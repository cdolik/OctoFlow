import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import performanceRouter from './api/performanceApi';
import { logger } from './utils/logger';

const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));

app.use(express.json({ limit: '10kb' }));

// Apply performance router
app.use('/api/performance', performanceRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info('Environment:', process.env.NODE_ENV || 'development');
  logger.info('API Key:', process.env.REACT_APP_API_KEY ? '✓ Set' : '✗ Not set');
}); 