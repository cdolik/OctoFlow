/**
 * GitHub API Service
 * Handles all GitHub API requests through our local proxy server
 */

// GitHub API service
import {
  GitHubUser,
  GitHubRepository,
  GitHubOrganization,
  GitHubContributor,
  GitHubCommit,
  GitHubPullRequest,
  GitHubIssue,
  GitHubWorkflowsResponse,
  GitHubBranch,
  GitHubTopicsResponse
} from '../types/github';

// Import secure token management utilities
import {
  storeGitHubToken,
  getGitHubToken,
  clearGitHubToken,
  hasValidGitHubToken
} from '../utils/tokenUtils';

// Import rate limiting utilities
import { applyRateLimit } from '../utils/rateLimitUtils';

// Base URL for API requests
const BASE_URL = 'https://api.github.com';

/**
 * Set the GitHub token for API requests
 * @param token GitHub token to store
 * @param expiryMs Optional expiration time in milliseconds
 * @returns Boolean indicating if token was stored successfully
 */
export const setGitHubToken = (token: string, expiryMs?: number): boolean => {
  return storeGitHubToken(token, expiryMs);
};

/**
 * Check if a valid GitHub token is available
 * @returns Boolean indicating if a valid token is available
 */
export const hasGitHubToken = (): boolean => {
  return hasValidGitHubToken();
};

/**
 * GitHub API Error class for better error handling
 */
export class GitHubApiError extends Error {
  status?: number;
  endpoint: string;
  isRateLimitError: boolean;
  
  constructor(message: string, endpoint: string, status?: number, isRateLimitError = false) {
    super(message);
    this.name = 'GitHubApiError';
    this.endpoint = endpoint;
    this.status = status;
    this.isRateLimitError = isRateLimitError;
  }
  
  // Get a user-friendly message that can be displayed in the UI
  getUserFriendlyMessage(): string {
    if (this.isRateLimitError) {
      return 'GitHub API rate limit exceeded. Please try again later or authenticate to get a higher rate limit.';
    }
    
    switch (this.status) {
      case 401:
        return 'Your GitHub authentication has expired. Please sign in again.';
      case 403:
        return 'You don\'t have permission to access this resource on GitHub.';
      case 404:
        return 'The requested GitHub resource could not be found. Please check that the repository exists.';
      case 422:
        return 'The GitHub API couldn\'t process your request. Please check your inputs.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'GitHub is experiencing issues right now. Please try again later.';
      default:
        return this.message || 'An error occurred while communicating with GitHub.';
    }
  }
}

// Helper function to handle API errors
const handleGitHubError = (error: any, endpoint: string): GitHubApiError => {
  console.error(`GitHub API Error (${endpoint}):`, error);
  
  // Check if it's a response error
  if (error.response) {
    const status = error.response.status;
    const errorMessage = error.response.data?.message || 'Unknown error';
    
    // Handle specific status codes
    switch (status) {
      case 401:
        return new GitHubApiError(
          'Authentication failed. Please check your GitHub token and try again.',
          endpoint,
          status
        );
      case 403:
        // Check if it's a rate limit error
        if (error.response.headers && 
            error.response.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = error.response.headers['x-ratelimit-reset'];
          const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() : 'soon';
          
          return new GitHubApiError(
            `GitHub API rate limit exceeded. Limit will reset at ${resetDate}.`,
            endpoint,
            status,
            true
          );
        }
        return new GitHubApiError(
          'Access forbidden. You may not have permission to perform this action.',
          endpoint,
          status
        );
      case 404:
        return new GitHubApiError(
          'Resource not found. The repository or data you requested doesn\'t exist.',
          endpoint,
          status
        );
      case 422:
        return new GitHubApiError(
          `Validation failed: ${errorMessage}`,
          endpoint,
          status
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new GitHubApiError(
          `GitHub service error (${status}): ${errorMessage}`,
          endpoint,
          status
        );
      default:
        return new GitHubApiError(
          `GitHub API error (${status}): ${errorMessage}`,
          endpoint,
          status
        );
    }
  }
  
  // Network or other errors
  if (error.request) {
    return new GitHubApiError(
      'Network error. Please check your internet connection and try again.',
      endpoint
    );
  }
  
  // Default fallback
  return new GitHubApiError(
    `Error accessing GitHub API: ${error.message || 'Unknown error'}`,
    endpoint
  );
};

// Replace the headers.entries() usage with a more compatible approach
const headersToObject = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * Make a GET request to the GitHub API
 * @param endpoint API endpoint to call
 * @param params Query parameters
 * @param rateLimitTier Rate limit tier to apply
 * @returns Promise with the API response
 */
export const fetchFromGitHub = async <T>(
  endpoint: string, 
  params: Record<string, string> = {},
  rateLimitTier: 'standard' | 'auth' | 'sensitive' = 'standard'
): Promise<T> => {
  const token = getGitHubToken();
  
  if (!token) {
    throw new GitHubApiError('GitHub token is required for authentication', endpoint, 401);
  }
  
  // Apply rate limiting
  const clientId = 'github-api'; // In a real app, use a unique identifier per user
  const { result: rateLimit, headers: rateLimitHeaders } = applyRateLimit(clientId, rateLimitTier);
  
  // Check if rate limited
  if (!rateLimit.allowed) {
    const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString();
    throw new GitHubApiError(
      `Rate limit exceeded. Limit will reset at ${resetTime}.`,
      endpoint,
      429,
      true
    );
  }
  
  // Convert params to query string
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OctoFlow-App'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw { 
        response: {
          status: response.status,
          data: errorData,
          statusText: response.statusText,
          headers: headersToObject(response.headers)
        }
      };
    }
    
    return await response.json();
  } catch (error) {
    throw handleGitHubError(error, endpoint);
  }
};

/**
 * Make a POST request to the GitHub API
 * @param endpoint API endpoint to call
 * @param data Data to send in the request body
 * @param rateLimitTier Rate limit tier to apply
 * @returns Promise with the API response
 */
export const postToGitHub = async <T>(
  endpoint: string, 
  data: unknown,
  rateLimitTier: 'standard' | 'auth' | 'sensitive' = 'sensitive'
): Promise<T> => {
  const token = getGitHubToken();
  
  if (!token) {
    throw new GitHubApiError('GitHub token is required for authentication', endpoint, 401);
  }
  
  // Apply rate limiting - use 'sensitive' tier by default for POST requests
  const clientId = 'github-api'; // In a real app, use a unique identifier per user
  const { result: rateLimit, headers: rateLimitHeaders } = applyRateLimit(clientId, rateLimitTier);
  
  // Check if rate limited
  if (!rateLimit.allowed) {
    const resetTime = new Date(rateLimit.resetTime).toLocaleTimeString();
    throw new GitHubApiError(
      `Rate limit exceeded. Limit will reset at ${resetTime}.`,
      endpoint,
      429,
      true
    );
  }
  
  const url = `${BASE_URL}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'OctoFlow-App'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw { 
        response: {
          status: response.status,
          data: errorData,
          statusText: response.statusText,
          headers: headersToObject(response.headers)
        }
      };
    }
    
    return await response.json();
  } catch (error) {
    throw handleGitHubError(error, endpoint);
  }
};

/**
 * Get the authenticated user's profile
 */
export const getUserProfile = async (): Promise<GitHubUser> => {
  return fetchFromGitHub<GitHubUser>('user');
};

/**
 * Get repositories for the authenticated user
 */
export const getUserRepositories = async (sort = 'updated'): Promise<GitHubRepository[]> => {
  return fetchFromGitHub<GitHubRepository[]>('user/repos', { sort, per_page: '100' });
};

/**
 * Get organization repositories
 */
export const getOrganizationRepositories = async (org: string): Promise<GitHubRepository[]> => {
  return fetchFromGitHub<GitHubRepository[]>(`orgs/${org}/repos`, { per_page: '100' });
};

/**
 * Get repository details
 */
export const getRepositoryDetails = async (owner: string, repo: string): Promise<GitHubRepository> => {
  return fetchFromGitHub<GitHubRepository>(`repos/${owner}/${repo}`);
};

/**
 * Get repository contributors
 */
export const getRepositoryContributors = async (owner: string, repo: string): Promise<GitHubContributor[]> => {
  return fetchFromGitHub<GitHubContributor[]>(`repos/${owner}/${repo}/contributors`);
};

/**
 * Get repository commits
 */
export const getRepositoryCommits = async (owner: string, repo: string): Promise<GitHubCommit[]> => {
  return fetchFromGitHub<GitHubCommit[]>(`repos/${owner}/${repo}/commits`);
};

/**
 * Get repository pull requests
 */
export const getRepositoryPullRequests = async (owner: string, repo: string, state = 'all'): Promise<GitHubPullRequest[]> => {
  return fetchFromGitHub<GitHubPullRequest[]>(`repos/${owner}/${repo}/pulls`, { state });
};

/**
 * Get repository issues
 */
export const getRepositoryIssues = async (owner: string, repo: string, state = 'all'): Promise<GitHubIssue[]> => {
  return fetchFromGitHub<GitHubIssue[]>(`repos/${owner}/${repo}/issues`, { state });
};

/**
 * Get repository workflows
 */
export const getRepositoryWorkflows = async (owner: string, repo: string): Promise<GitHubWorkflowsResponse> => {
  return fetchFromGitHub<GitHubWorkflowsResponse>(`repos/${owner}/${repo}/actions/workflows`);
};

/**
 * Get repository branches
 */
export const getRepositoryBranches = async (owner: string, repo: string): Promise<GitHubBranch[]> => {
  return fetchFromGitHub<GitHubBranch[]>(`repos/${owner}/${repo}/branches`);
};

/**
 * Get repository topics
 */
export const getRepositoryTopics = async (owner: string, repo: string): Promise<GitHubTopicsResponse> => {
  return fetchFromGitHub<GitHubTopicsResponse>(`repos/${owner}/${repo}/topics`);
};

/**
 * Get user organizations
 */
export const getUserOrganizations = async (): Promise<GitHubOrganization[]> => {
  return fetchFromGitHub<GitHubOrganization[]>('user/orgs');
};

export default {
  setGitHubToken,
  hasGitHubToken,
  clearGitHubToken,
  fetchFromGitHub,
  postToGitHub,
  getUserProfile,
  getUserRepositories,
  getOrganizationRepositories,
  getRepositoryDetails,
  getRepositoryContributors,
  getRepositoryCommits,
  getRepositoryPullRequests,
  getRepositoryIssues,
  getRepositoryWorkflows,
  getRepositoryBranches,
  getRepositoryTopics,
  getUserOrganizations
}; 