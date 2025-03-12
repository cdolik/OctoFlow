/**
 * Rate limiting utilities for OctoFlow
 * Provides functions for implementing tiered rate limiting
 */

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// Default rate limit settings from environment variables
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const DEFAULT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10);

// Tiered rate limit configurations
const rateLimitTiers: Record<string, RateLimitConfig> = {
  // Standard API endpoints
  standard: {
    windowMs: DEFAULT_WINDOW_MS,
    maxRequests: DEFAULT_MAX_REQUESTS
  },
  
  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: DEFAULT_WINDOW_MS,
    maxRequests: Math.min(DEFAULT_MAX_REQUESTS, 50) // Max 50 requests per window for auth
  },
  
  // Sensitive operations (very restrictive)
  sensitive: {
    windowMs: DEFAULT_WINDOW_MS,
    maxRequests: Math.min(DEFAULT_MAX_REQUESTS, 20) // Max 20 requests per window for sensitive operations
  }
};

// In-memory store for rate limiting
// Note: In a production environment, use Redis or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Checks if a request should be rate limited
 * @param clientId Identifier for the client (e.g., IP address)
 * @param tier Rate limit tier to apply
 * @returns Object indicating if request is allowed and when limit resets
 */
export const checkRateLimit = (
  clientId: string,
  tier: 'standard' | 'auth' | 'sensitive' = 'standard'
): { allowed: boolean; resetTime: number; remaining: number } => {
  const config = rateLimitTiers[tier];
  const now = Date.now();
  
  // Initialize or get client's rate limit data
  if (!rateLimitStore[clientId] || rateLimitStore[clientId].resetTime < now) {
    rateLimitStore[clientId] = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  // Increment request count
  rateLimitStore[clientId].count += 1;
  
  // Check if rate limit exceeded
  const isAllowed = rateLimitStore[clientId].count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - rateLimitStore[clientId].count);
  
  return {
    allowed: isAllowed,
    resetTime: rateLimitStore[clientId].resetTime,
    remaining
  };
};

/**
 * Middleware-style function to apply rate limiting
 * @param clientId Identifier for the client
 * @param tier Rate limit tier to apply
 * @returns Object with rate limit result and headers
 */
export const applyRateLimit = (
  clientId: string,
  tier: 'standard' | 'auth' | 'sensitive' = 'standard'
): { 
  result: { allowed: boolean; resetTime: number; remaining: number };
  headers: Record<string, string>;
} => {
  const result = checkRateLimit(clientId, tier);
  
  // Generate standard rate limit headers
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitTiers[tier].maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };
  
  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString();
  }
  
  return { result, headers };
};

/**
 * Clears rate limit data for testing or reset purposes
 * @param clientId Optional client ID to clear, or all clients if not specified
 */
export const clearRateLimitData = (clientId?: string): void => {
  if (clientId) {
    delete rateLimitStore[clientId];
  } else {
    Object.keys(rateLimitStore).forEach(key => {
      delete rateLimitStore[key];
    });
  }
}; 