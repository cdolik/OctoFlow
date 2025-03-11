/**
 * Application Configuration
 * 
 * IMPORTANT: This is an unofficial GitHub OctoFlow application.
 * Not affiliated with GitHub, Inc.
 */

// GitHub OAuth Configuration
// For demonstration purposes only - in a real app, use environment variables
export const GITHUB_CLIENT_ID = 'Iv1.example-placeholder-id';

// API URL Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Application Information
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'OctoFlow (Unofficial)';
export const APP_DISCLAIMER = 'This is an unofficial GitHub OctoFlow application. Not affiliated with GitHub, Inc.';

// Feature Flags
export const FEATURES = {
  GITHUB_AUTH: true,
  REPOSITORY_ANALYSIS: true,
  REPOSITORY_TRENDS: true,
  ELIGIBILITY_CHECK: true,
  EXPORT_SHARE: true
}; 