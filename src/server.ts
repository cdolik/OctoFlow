/**
 * OctoFlow Server
 * 
 * This is the main server file for the OctoFlow application.
 * It sets up the Express application and includes all API routes.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import API routes
import repositoryHealthApi from './api/repositoryHealthApi';

// Create Express application
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API routes
app.use('/api/health', repositoryHealthApi);

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', message: 'OctoFlow API is running' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back the React app's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`OctoFlow server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Gracefully shutdown the server
  process.exit(1);
});

export default app; 