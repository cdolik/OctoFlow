// GitHub API Types

export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// User type for GitHub for Startups eligibility
export interface User {
  id: string;
  login: string;
  name?: string;
  email?: string;
  isGitHubEnterpriseCustomer: boolean;
  seriesFundingStage: string;
  isGitHubForStartupsPartner: boolean;
  employeeCount: number;
  companyAgeYears: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  default_branch: string;
  open_issues_count: number;
  topics: string[];
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_readme?: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  security_and_analysis?: {
    advanced_security?: {
      status: string;
    };
    secret_scanning?: {
      status: string;
    };
    secret_scanning_push_protection?: {
      status: string;
    };
  };
}

export interface GitHubOrganization {
  login: string;
  id: number;
  url: string;
  repos_url: string;
  avatar_url: string;
  description: string | null;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  draft: boolean;
  additions?: number;
  deletions?: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  body: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  html_url: string;
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments?: number;
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubWorkflowsResponse {
  total_count: number;
  workflows: GitHubWorkflow[];
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubTopicsResponse {
  names: string[];
} 