/**
 * GitHub Actions Integration Service
 * 
 * This service provides integration with GitHub Actions to automate the implementation
 * of recommendations and improve repository health.
 */

import { Recommendation } from './assessmentService';

// Define workflow template interfaces
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'reliability' | 'maintainability' | 'collaboration' | 'velocity';
  content: string;
  recommendationIds: string[]; // IDs of recommendations this workflow addresses
}

export interface WorkflowDeploymentResult {
  success: boolean;
  message: string;
  workflowUrl?: string;
  pullRequestUrl?: string;
}

/**
 * GitHub Actions Service class
 */
export class GitHubActionsService {
  private workflowTemplates: WorkflowTemplate[] = [];
  
  constructor() {
    this.initializeTemplates();
  }
  
  /**
   * Initialize workflow templates
   */
  private initializeTemplates() {
    // Security workflows
    this.workflowTemplates.push({
      id: 'security-scan',
      name: 'Security Scanning Workflow',
      description: 'Automatically scan your repository for security vulnerabilities using CodeQL.',
      category: 'security',
      recommendationIds: ['security-branch-protection', 'security-policy'],
      content: `name: "Security Scanning"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # Run every Sunday at midnight

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript', 'typescript' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: \${{ matrix.language }}

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2`
    });
    
    // Reliability workflows
    this.workflowTemplates.push({
      id: 'ci-workflow',
      name: 'CI Workflow',
      description: 'Set up continuous integration to automatically build and test your code.',
      category: 'reliability',
      recommendationIds: ['reliability-cicd'],
      content: `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Lint
      run: npm run lint
    - name: Test
      run: npm test
    - name: Build
      run: npm run build`
    });
    
    // Maintainability workflows
    this.workflowTemplates.push({
      id: 'code-quality',
      name: 'Code Quality Workflow',
      description: 'Automatically check code quality and enforce coding standards.',
      category: 'maintainability',
      recommendationIds: ['maintainability-readme', 'maintainability-codeowners'],
      content: `name: Code Quality

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Lint
      run: npm run lint
    - name: Check formatting
      run: npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,scss}"
    - name: Run type check
      run: npx tsc --noEmit`
    });
    
    // Collaboration workflows
    this.workflowTemplates.push({
      id: 'auto-assign',
      name: 'Auto Assign Workflow',
      description: 'Automatically assign pull requests to team members for review.',
      category: 'collaboration',
      recommendationIds: ['collaboration-review-time', 'collaboration-pr-template'],
      content: `name: Auto Assign

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: kentaro-m/auto-assign-action@v1.2.4
      with:
        configuration-path: '.github/auto_assign.yml'`
    });
    
    // Velocity workflows
    this.workflowTemplates.push({
      id: 'auto-merge',
      name: 'Auto Merge Workflow',
      description: 'Automatically merge pull requests that meet certain criteria.',
      category: 'velocity',
      recommendationIds: ['velocity-merge-time'],
      content: `name: Auto Merge

on:
  pull_request:
    types: [labeled, unlabeled, synchronize, opened, edited, ready_for_review, reopened, unlocked]
  pull_request_review:
    types: [submitted, edited, dismissed]
  check_suite:
    types: [completed]
  status: {}

jobs:
  automerge:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: pascalgn/automerge-action@v0.15.5
      env:
        GITHUB_TOKEN: "\${{ secrets.GITHUB_TOKEN }}"
        MERGE_LABELS: "automerge,!work in progress"
        MERGE_METHOD: "squash"
        MERGE_COMMIT_MESSAGE: "pull-request-title"
        MERGE_REQUIRED_APPROVALS: "1"
        MERGE_DELETE_BRANCH: "true"`
    });
  }
  
  /**
   * Get all workflow templates
   */
  getAllWorkflowTemplates(): WorkflowTemplate[] {
    return this.workflowTemplates;
  }
  
  /**
   * Get workflow templates by category
   */
  getWorkflowTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
    return this.workflowTemplates.filter(template => template.category === category);
  }
  
  /**
   * Get workflow templates for a specific recommendation
   */
  getWorkflowTemplatesForRecommendation(recommendationId: string): WorkflowTemplate[] {
    return this.workflowTemplates.filter(template => 
      template.recommendationIds.includes(recommendationId)
    );
  }
  
  /**
   * Deploy a workflow to a repository
   */
  async deployWorkflow(
    owner: string,
    repo: string,
    templateId: string,
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> {
    // Find the template
    const template = this.workflowTemplates.find(t => t.id === templateId);
    
    if (!template) {
      return {
        success: false,
        message: `Workflow template with ID "${templateId}" not found.`
      };
    }
    
    // In a real implementation, this would use the GitHub API to create a workflow file
    // For now, we'll return a mock result
    
    if (createPullRequest) {
      return {
        success: true,
        message: `Created pull request to add ${template.name} workflow.`,
        pullRequestUrl: `https://github.com/${owner}/${repo}/pull/123`,
        workflowUrl: `https://github.com/${owner}/${repo}/actions/workflows/${template.id}.yml`
      };
    } else {
      return {
        success: true,
        message: `Added ${template.name} workflow directly to the repository.`,
        workflowUrl: `https://github.com/${owner}/${repo}/actions/workflows/${template.id}.yml`
      };
    }
  }
  
  /**
   * Generate configuration files for workflows
   */
  generateConfigurationFiles(templateId: string): Record<string, string> {
    // Generate additional configuration files needed for the workflow
    // Returns a map of file paths to file contents
    
    const configFiles: Record<string, string> = {};
    
    if (templateId === 'auto-assign') {
      configFiles['.github/auto_assign.yml'] = `# Auto assign configuration
addReviewers: true
addAssignees: author
reviewers:
  - teamMember1
  - teamMember2
  - teamMember3
numberOfReviewers: 1
skipKeywords:
  - wip
  - draft`;
    }
    
    return configFiles;
  }
  
  /**
   * Create a GitHub Actions workflow to implement a recommendation
   */
  async createWorkflowForRecommendation(
    owner: string,
    repo: string,
    recommendation: Recommendation,
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> {
    // Find templates for this recommendation
    const templates = this.getWorkflowTemplatesForRecommendation(recommendation.id);
    
    if (templates.length === 0) {
      return {
        success: false,
        message: `No workflow templates found for recommendation "${recommendation.id}".`
      };
    }
    
    // Use the first matching template
    return this.deployWorkflow(owner, repo, templates[0].id, createPullRequest);
  }
  
  /**
   * Create a custom GitHub Actions workflow
   */
  async createCustomWorkflow(
    owner: string,
    repo: string,
    name: string,
    content: string,
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> {
    // In a real implementation, this would use the GitHub API to create a custom workflow file
    // For now, we'll return a mock result
    
    if (createPullRequest) {
      return {
        success: true,
        message: `Created pull request to add custom workflow "${name}".`,
        pullRequestUrl: `https://github.com/${owner}/${repo}/pull/124`,
        workflowUrl: `https://github.com/${owner}/${repo}/actions/workflows/${name.toLowerCase().replace(/\s+/g, '-')}.yml`
      };
    } else {
      return {
        success: true,
        message: `Added custom workflow "${name}" directly to the repository.`,
        workflowUrl: `https://github.com/${owner}/${repo}/actions/workflows/${name.toLowerCase().replace(/\s+/g, '-')}.yml`
      };
    }
  }
}

// Export singleton instance
export const githubActionsService = new GitHubActionsService(); 