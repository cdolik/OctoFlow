/**
 * Token management utilities for OctoFlow
 * Provides secure functions for handling authentication tokens
 */

import { 
  validateGitHubToken, 
  secureStore, 
  secureRetrieve, 
  secureRemove 
} from './securityUtils';

// Storage keys
const TOKEN_STORAGE_KEY = 'octoflow_github_token';
const TOKEN_EXPIRY_KEY = 'octoflow_token_expiry';

// Default token expiration (24 hours)
const DEFAULT_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Securely stores a GitHub token with expiration
 * @param token GitHub token to store
 * @param expiryMs Expiration time in milliseconds (default: 24 hours)
 * @returns Boolean indicating if token was stored successfully
 */
export const storeGitHubToken = (
  token: string, 
  expiryMs: number = DEFAULT_TOKEN_EXPIRY_MS
): boolean => {
  try {
    // Validate token before storing
    if (!validateGitHubToken(token)) {
      console.error('Invalid GitHub token format');
      return false;
    }
    
    // Calculate expiration time
    const expiryTime = Date.now() + expiryMs;
    
    // Store token and expiry
    secureStore(TOKEN_STORAGE_KEY, token);
    secureStore(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('Error storing GitHub token:', error);
    return false;
  }
};

/**
 * Retrieves the stored GitHub token if valid and not expired
 * @returns GitHub token or null if not found, invalid, or expired
 */
export const getGitHubToken = (): string | null => {
  try {
    // Get token and expiry
    const token = secureRetrieve(TOKEN_STORAGE_KEY);
    const expiryTimeStr = secureRetrieve(TOKEN_EXPIRY_KEY);
    
    // Check if token exists
    if (!token) {
      return null;
    }
    
    // Check if token is valid
    if (!validateGitHubToken(token)) {
      console.warn('Invalid GitHub token found in storage');
      clearGitHubToken();
      return null;
    }
    
    // Check if token is expired
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr, 10);
      if (Date.now() > expiryTime) {
        console.warn('GitHub token has expired');
        clearGitHubToken();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error retrieving GitHub token:', error);
    return null;
  }
};

/**
 * Clears the stored GitHub token and expiry
 */
export const clearGitHubToken = (): void => {
  try {
    secureRemove(TOKEN_STORAGE_KEY);
    secureRemove(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing GitHub token:', error);
  }
};

/**
 * Refreshes the token expiration time
 * @param expiryMs New expiration time in milliseconds (default: 24 hours)
 * @returns Boolean indicating if token expiry was refreshed successfully
 */
export const refreshTokenExpiry = (
  expiryMs: number = DEFAULT_TOKEN_EXPIRY_MS
): boolean => {
  try {
    // Get current token
    const token = secureRetrieve(TOKEN_STORAGE_KEY);
    
    // Check if token exists
    if (!token) {
      return false;
    }
    
    // Calculate new expiration time
    const expiryTime = Date.now() + expiryMs;
    
    // Update expiry
    secureStore(TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('Error refreshing token expiry:', error);
    return false;
  }
};

/**
 * Checks if a GitHub token is stored and valid
 * @returns Boolean indicating if a valid token is available
 */
export const hasValidGitHubToken = (): boolean => {
  return getGitHubToken() !== null;
};

/**
 * Gets the remaining time until token expiration
 * @returns Remaining time in milliseconds, or null if no valid token
 */
export const getTokenExpiryRemaining = (): number | null => {
  try {
    // Get expiry time
    const expiryTimeStr = secureRetrieve(TOKEN_EXPIRY_KEY);
    
    // Check if expiry exists
    if (!expiryTimeStr) {
      return null;
    }
    
    // Calculate remaining time
    const expiryTime = parseInt(expiryTimeStr, 10);
    const remainingMs = expiryTime - Date.now();
    
    return Math.max(0, remainingMs);
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
}; 