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

// Base URL for API requests
const BASE_URL = 'https://api.github.com';

// Token management
const TOKEN_STORAGE_KEY = 'github_token';

/**
 * Set the GitHub token for API requests
 */
export const setGitHubToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

/**
 * Get the current GitHub token
 */
export const getGitHubToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Clear the GitHub token
 */
export const clearGitHubToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Make a GET request to the GitHub API
 */
export const fetchFromGitHub = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const token = getGitHubToken();
  
  if (!token) {
    throw new Error('GitHub token is required');
  }
  
  // Convert params to query string
  const queryParams = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
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
    throw new Error(
      errorData?.message || `GitHub API error: ${response.status} ${response.statusText}`
    );
  }
  
  return response.json();
};

/**
 * Make a POST request to the GitHub API
 */
export const postToGitHub = async <T>(endpoint: string, data: unknown): Promise<T> => {
  const token = getGitHubToken();
  
  if (!token) {
    throw new Error('GitHub token is required');
  }
  
  const url = `${BASE_URL}/${endpoint}`;
  
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
    throw new Error(
      errorData?.message || `GitHub API error: ${response.status} ${response.statusText}`
    );
  }
  
  return response.json();
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
  getGitHubToken,
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