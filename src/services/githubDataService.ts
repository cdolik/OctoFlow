/**
 * Comprehensive GitHub Data Service
 * 
 * This service handles all GitHub API data collection, caching, and processing
 * to support the GitHub Well-Architected Framework assessment.
 */

import { fetchFromGitHub, postToGitHub } from './githubApi';
import { 
  GitHubRepository, 
  GitHubBranch,
  GitHubPullRequest,
  GitHubIssue,
  GitHubWorkflowsResponse,
  GitHubCommit
} from '../types/github';

// Define interfaces for the Well-Architected Framework data
export interface SecurityInsights {
  branchProtectionRules: any[];
  vulnerabilityAlerts: any[];
  codeScanning: any[];
  secretScanning: any[];
  hasSecurityPolicy: boolean;
  securityScore: number;
}

export interface ReliabilityInsights {
  cicdSetup: boolean;
  workflowRuns: any[];
  successRate: number;
  deploymentFrequency: number;
  testCoverage: number | null;
  reliabilityScore: number;
}

export interface MaintainabilityInsights {
  codeOwners: boolean;
  hasReadme: boolean;
  readmeQuality: number;
  hasContributing: boolean;
  hasLicense: boolean;
  dependencyManagement: boolean;
  codeQuality: number;
  maintainabilityScore: number;
}

export interface CollaborationInsights {
  prReviewProcess: boolean;
  avgReviewTime: number;
  prApprovalRate: number;
  issueTemplates: boolean;
  prTemplates: boolean;
  issueResponseTime: number;
  collaborationScore: number;
}

export interface VelocityInsights {
  timeToMerge: number;
  deploymentFrequency: number;
  commitFrequency: number;
  issueResolutionTime: number;
  prSize: number;
  velocityScore: number;
}

export interface RepositoryHealthInsights {
  security: SecurityInsights;
  reliability: ReliabilityInsights;
  maintainability: MaintainabilityInsights;
  collaboration: CollaborationInsights;
  velocity: VelocityInsights;
  overallScore: number;
  lastUpdated: Date;
}

/**
 * GitHub Data Service class
 */
export class GitHubDataService {
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  /**
   * Get cached data or fetch new data
   */
  private async getCachedOrFetch<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    
    const data = await fetchFn();
    this.cache.set(cacheKey, { data, timestamp: now });
    return data;
  }

  /**
   * Fetch basic repository data
   */
  async fetchRepositoryData(owner: string, repo: string): Promise<GitHubRepository> {
    const cacheKey = `repo:${owner}/${repo}`;
    return this.getCachedOrFetch(cacheKey, () => 
      fetchFromGitHub<GitHubRepository>(`repos/${owner}/${repo}`)
    );
  }

  /**
   * Fetch security insights
   */
  async fetchSecurityInsights(owner: string, repo: string): Promise<SecurityInsights> {
    const cacheKey = `security:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Fetch branch protection rules
      const branches = await fetchFromGitHub<GitHubBranch[]>(`repos/${owner}/${repo}/branches`);
      const protectedBranches = branches.filter(branch => branch.protected);
      
      // Check for branch protection on default branch
      const repoData = await this.fetchRepositoryData(owner, repo);
      const defaultBranchProtected = protectedBranches.some(branch => branch.name === repoData.default_branch);
      
      // Check for security policy
      const securityPolicy = await fetchFromGitHub<any>(`repos/${owner}/${repo}/security/policy`)
        .catch(() => null);
      
      // Check for vulnerability alerts (requires Dependabot access)
      const vulnerabilityAlerts = await fetchFromGitHub<any[]>(`repos/${owner}/${repo}/vulnerability-alerts`)
        .catch(() => []);
      
      // Calculate security score (simplified)
      let securityScore = 0;
      if (defaultBranchProtected) securityScore += 40;
      if (securityPolicy) securityScore += 20;
      if (protectedBranches.length > 0) securityScore += 20;
      if (vulnerabilityAlerts.length === 0) securityScore += 20; // No vulnerabilities is good
      
      return {
        branchProtectionRules: protectedBranches,
        vulnerabilityAlerts: vulnerabilityAlerts,
        codeScanning: [], // Would require GitHub Advanced Security
        secretScanning: [], // Would require GitHub Advanced Security
        hasSecurityPolicy: !!securityPolicy,
        securityScore
      };
    });
  }

  /**
   * Fetch workflow and CI/CD data
   */
  async fetchWorkflowData(owner: string, repo: string): Promise<ReliabilityInsights> {
    const cacheKey = `workflow:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Fetch workflows
      const workflows = await fetchFromGitHub<GitHubWorkflowsResponse>(`repos/${owner}/${repo}/actions/workflows`)
        .catch(() => ({ workflows: [] }));
      
      // Fetch recent workflow runs
      const workflowRuns = await fetchFromGitHub<any>(`repos/${owner}/${repo}/actions/runs?per_page=100`)
        .catch(() => ({ workflow_runs: [] }));
      
      const runs = workflowRuns.workflow_runs || [];
      
      // Calculate success rate
      const successfulRuns = runs.filter(run => run.conclusion === 'success').length;
      const successRate = runs.length > 0 ? (successfulRuns / runs.length) * 100 : 0;
      
      // Calculate deployment frequency (simplified)
      const deploymentWorkflows = workflows.workflows.filter(wf => 
        wf.name.toLowerCase().includes('deploy') || 
        wf.path.toLowerCase().includes('deploy')
      );
      
      const deploymentFrequency = deploymentWorkflows.length > 0 ? 
        runs.filter(run => 
          deploymentWorkflows.some(wf => wf.id === run.workflow_id) && 
          run.conclusion === 'success'
        ).length : 0;
      
      // Calculate reliability score (simplified)
      let reliabilityScore = 0;
      if (workflows.workflows.length > 0) reliabilityScore += 30;
      if (successRate > 90) reliabilityScore += 40;
      if (successRate > 75) reliabilityScore += 20;
      if (deploymentFrequency > 0) reliabilityScore += 10;
      
      return {
        cicdSetup: workflows.workflows.length > 0,
        workflowRuns: runs,
        successRate,
        deploymentFrequency,
        testCoverage: null, // Would require additional integration
        reliabilityScore: Math.min(reliabilityScore, 100)
      };
    });
  }

  /**
   * Fetch code quality and maintainability metrics
   */
  async fetchMaintainabilityInsights(owner: string, repo: string): Promise<MaintainabilityInsights> {
    const cacheKey = `maintainability:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Check for README
      const readme = await fetchFromGitHub<any>(`repos/${owner}/${repo}/readme`)
        .catch(() => null);
      
      // Check for CODEOWNERS
      const codeowners = await fetchFromGitHub<any>(`repos/${owner}/${repo}/contents/.github/CODEOWNERS`)
        .catch(() => null);
      
      // Check for CONTRIBUTING guide
      const contributing = await fetchFromGitHub<any>(`repos/${owner}/${repo}/contents/.github/CONTRIBUTING.md`)
        .catch(() => 
          fetchFromGitHub<any>(`repos/${owner}/${repo}/contents/CONTRIBUTING.md`).catch(() => null)
        );
      
      // Check for LICENSE
      const license = await fetchFromGitHub<any>(`repos/${owner}/${repo}/license`)
        .catch(() => null);
      
      // Calculate README quality (simplified)
      const readmeQuality = readme ? 
        (readme.size > 5000 ? 100 : (readme.size / 50)) : 0;
      
      // Calculate maintainability score (simplified)
      let maintainabilityScore = 0;
      if (readme) maintainabilityScore += 25;
      if (codeowners) maintainabilityScore += 25;
      if (contributing) maintainabilityScore += 20;
      if (license) maintainabilityScore += 20;
      if (readmeQuality > 50) maintainabilityScore += 10;
      
      return {
        codeOwners: !!codeowners,
        hasReadme: !!readme,
        readmeQuality,
        hasContributing: !!contributing,
        hasLicense: !!license,
        dependencyManagement: false, // Would require additional analysis
        codeQuality: 0, // Would require code analysis integration
        maintainabilityScore
      };
    });
  }

  /**
   * Fetch collaboration insights
   */
  async fetchCollaborationInsights(owner: string, repo: string): Promise<CollaborationInsights> {
    const cacheKey = `collaboration:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Fetch recent PRs
      const prs = await fetchFromGitHub<GitHubPullRequest[]>(`repos/${owner}/${repo}/pulls?state=all&per_page=100`)
        .catch(() => []);
      
      // Fetch recent issues
      const issues = await fetchFromGitHub<GitHubIssue[]>(`repos/${owner}/${repo}/issues?state=all&per_page=100`)
        .catch(() => []);
      
      // Check for PR templates
      const prTemplate = await fetchFromGitHub<any>(`repos/${owner}/${repo}/contents/.github/PULL_REQUEST_TEMPLATE.md`)
        .catch(() => null);
      
      // Check for issue templates
      const issueTemplateDir = await fetchFromGitHub<any[]>(`repos/${owner}/${repo}/contents/.github/ISSUE_TEMPLATE`)
        .catch(() => []);
      
      // Calculate average review time
      const reviewTimes = prs
        .filter(pr => pr.merged_at)
        .map(pr => {
          const created = new Date(pr.created_at).getTime();
          const merged = new Date(pr.merged_at!).getTime();
          return (merged - created) / (1000 * 60 * 60); // hours
        });
      
      const avgReviewTime = reviewTimes.length > 0 ? 
        reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length : 0;
      
      // Calculate PR approval rate
      const prApprovalRate = prs.length > 0 ? 
        (prs.filter(pr => pr.merged_at).length / prs.length) * 100 : 0;
      
      // Calculate issue response time
      const issueResponseTimes = issues
        .filter(issue => issue.comments > 0)
        .map(issue => {
          // This is simplified - would need to fetch comments to get actual first response time
          return 24; // Placeholder: 24 hours
        });
      
      const issueResponseTime = issueResponseTimes.length > 0 ? 
        issueResponseTimes.reduce((sum, time) => sum + time, 0) / issueResponseTimes.length : 0;
      
      // Calculate collaboration score (simplified)
      let collaborationScore = 0;
      if (prTemplate) collaborationScore += 20;
      if (issueTemplateDir.length > 0) collaborationScore += 20;
      if (avgReviewTime < 24) collaborationScore += 20;
      if (prApprovalRate > 75) collaborationScore += 20;
      if (issueResponseTime < 48) collaborationScore += 20;
      
      return {
        prReviewProcess: prTemplate !== null,
        avgReviewTime,
        prApprovalRate,
        issueTemplates: issueTemplateDir.length > 0,
        prTemplates: prTemplate !== null,
        issueResponseTime,
        collaborationScore
      };
    });
  }

  /**
   * Fetch velocity insights
   */
  async fetchVelocityInsights(owner: string, repo: string): Promise<VelocityInsights> {
    const cacheKey = `velocity:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Fetch recent commits
      const commits = await fetchFromGitHub<GitHubCommit[]>(`repos/${owner}/${repo}/commits?per_page=100`)
        .catch(() => []);
      
      // Fetch recent PRs
      const prs = await fetchFromGitHub<GitHubPullRequest[]>(`repos/${owner}/${repo}/pulls?state=all&per_page=100`)
        .catch(() => []);
      
      // Fetch recent issues
      const issues = await fetchFromGitHub<GitHubIssue[]>(`repos/${owner}/${repo}/issues?state=all&per_page=100`)
        .catch(() => []);
      
      // Calculate time to merge
      const mergeTimes = prs
        .filter(pr => pr.merged_at)
        .map(pr => {
          const created = new Date(pr.created_at).getTime();
          const merged = new Date(pr.merged_at!).getTime();
          return (merged - created) / (1000 * 60 * 60); // hours
        });
      
      const timeToMerge = mergeTimes.length > 0 ? 
        mergeTimes.reduce((sum, time) => sum + time, 0) / mergeTimes.length : 0;
      
      // Calculate commit frequency (commits per week)
      const oldestCommitDate = commits.length > 0 ? 
        new Date(commits[commits.length - 1].commit.author.date).getTime() : Date.now();
      const newestCommitDate = commits.length > 0 ? 
        new Date(commits[0].commit.author.date).getTime() : Date.now();
      
      const weeksDiff = Math.max(1, (newestCommitDate - oldestCommitDate) / (1000 * 60 * 60 * 24 * 7));
      const commitFrequency = commits.length / weeksDiff;
      
      // Calculate issue resolution time
      const closedIssues = issues.filter(issue => issue.state === 'closed');
      const issueResolutionTimes = closedIssues.map(issue => {
        const created = new Date(issue.created_at).getTime();
        const closed = new Date(issue.closed_at!).getTime();
        return (closed - created) / (1000 * 60 * 60); // hours
      });
      
      const issueResolutionTime = issueResolutionTimes.length > 0 ? 
        issueResolutionTimes.reduce((sum, time) => sum + time, 0) / issueResolutionTimes.length : 0;
      
      // Calculate PR size (simplified)
      const prSize = prs.length > 0 ? 
        prs.reduce((sum, pr) => sum + (pr.additions || 0) + (pr.deletions || 0), 0) / prs.length : 0;
      
      // Calculate velocity score (simplified)
      let velocityScore = 0;
      if (timeToMerge < 24) velocityScore += 25;
      if (commitFrequency > 10) velocityScore += 25;
      if (issueResolutionTime < 72) velocityScore += 25;
      if (prSize < 300) velocityScore += 25;
      
      return {
        timeToMerge,
        deploymentFrequency: 0, // Calculated in reliability insights
        commitFrequency,
        issueResolutionTime,
        prSize,
        velocityScore
      };
    });
  }

  /**
   * Fetch comprehensive repository health insights
   */
  async fetchRepositoryHealthInsights(owner: string, repo: string): Promise<RepositoryHealthInsights> {
    // Fetch all insights in parallel
    const [security, reliability, maintainability, collaboration, velocity] = await Promise.all([
      this.fetchSecurityInsights(owner, repo),
      this.fetchWorkflowData(owner, repo),
      this.fetchMaintainabilityInsights(owner, repo),
      this.fetchCollaborationInsights(owner, repo),
      this.fetchVelocityInsights(owner, repo)
    ]);
    
    // Calculate overall score
    const overallScore = (
      security.securityScore * 0.25 +
      reliability.reliabilityScore * 0.2 +
      maintainability.maintainabilityScore * 0.2 +
      collaboration.collaborationScore * 0.15 +
      velocity.velocityScore * 0.2
    );
    
    return {
      security,
      reliability,
      maintainability,
      collaboration,
      velocity,
      overallScore,
      lastUpdated: new Date()
    };
  }

  /**
   * Clear cache for a specific repository
   */
  clearCache(owner: string, repo: string): void {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`${owner}/${repo}`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Export singleton instance
export const githubDataService = new GitHubDataService(); 