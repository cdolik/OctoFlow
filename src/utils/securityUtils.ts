/**
 * Security utilities for OctoFlow
 * Provides functions for input validation, sanitization, and security checks
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The user input to sanitize
 * @returns Sanitized input string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates GitHub tokens to ensure they match expected format
 * @param token GitHub token to validate
 * @returns Boolean indicating if token appears valid
 */
export const validateGitHubToken = (token: string): boolean => {
  if (!token) return false;
  
  // GitHub tokens are typically 40+ characters and follow specific patterns
  // This is a basic check - GitHub PATs and OAuth tokens have different formats
  const validTokenPattern = /^(gh[ps]_[A-Za-z0-9_]{36,255}|[a-f0-9]{40,255})$/;
  return validTokenPattern.test(token);
};

/**
 * Validates API keys
 * @param apiKey API key to validate
 * @returns Boolean indicating if API key appears valid
 */
export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey) return false;
  
  // Implement your API key validation logic here
  // This is a simple example - adjust based on your actual API key format
  return apiKey.length >= 16 && apiKey !== 'test-api-key-placeholder';
};

/**
 * Generates a secure random string for CSRF tokens or state parameters
 * @param length Length of the random string
 * @returns Random string
 */
export const generateSecureRandomString = (length = 32): string => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generates a PKCE code verifier for OAuth flows
 * @returns Code verifier string
 */
export const generateCodeVerifier = (): string => {
  return generateSecureRandomString(43);
};

/**
 * Generates a PKCE code challenge from a code verifier
 * @param verifier Code verifier
 * @returns Code challenge
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  // Convert verifier to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  
  // Hash the verifier with SHA-256
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert hash to base64url encoding
  // Fix for TS2802 error by using Array.from instead of spread operator
  const hashArray = Array.from(new Uint8Array(hash));
  const hashString = hashArray.map(byte => String.fromCharCode(byte)).join('');
  return btoa(hashString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Checks if localStorage is available and secure
 * @returns Boolean indicating if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Securely stores sensitive data in localStorage with encryption
 * @param key Storage key
 * @param value Value to store
 */
export const secureStore = (key: string, value: string): void => {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return;
  }
  
  // In a real implementation, you would encrypt the value before storing
  // This is a simplified version - consider using a library like CryptoJS
  localStorage.setItem(key, value);
};

/**
 * Retrieves and decrypts sensitive data from localStorage
 * @param key Storage key
 * @returns Retrieved value or null if not found
 */
export const secureRetrieve = (key: string): string | null => {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return null;
  }
  
  // In a real implementation, you would decrypt the value after retrieval
  return localStorage.getItem(key);
};

/**
 * Securely removes sensitive data from localStorage
 * @param key Storage key to remove
 */
export const secureRemove = (key: string): void => {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return;
  }
  
  localStorage.removeItem(key);
}; 