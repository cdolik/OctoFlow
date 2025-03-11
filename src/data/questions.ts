// Types for assessment questions
export interface Question {
  id: string;
  text: string;
  category: Category;
  tooltipText: string;
  githubDocsUrl: string;
}

export enum Category {
  Security = "Security",
  Collaboration = "Collaboration",
  Automation = "Automation",
  Compliance = "Compliance",
  Testing = "Testing",
  Documentation = "Documentation"
}

export enum StartupStage {
  Beginner = "Stage 1: Beginner",
  Intermediate = "Stage 2: Intermediate",
  Advanced = "Stage 3: Advanced"
}

// Questions for each assessment stage
export const questions: Record<StartupStage, Question[]> = {
  [StartupStage.Beginner]: [
    {
      id: "beginner-1",
      text: "Do you use GitHub Issues for tracking bugs and feature requests?",
      category: Category.Collaboration,
      tooltipText: "GitHub Issues provide a centralized way to track work and collaborate with team members.",
      githubDocsUrl: "https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues"
    },
    {
      id: "beginner-2",
      text: "Are pull requests (PRs) required for merging code into the main branch?",
      category: Category.Collaboration,
      tooltipText: "Pull requests provide a way to review code changes before they are merged into the main branch.",
      githubDocsUrl: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"
    },
    {
      id: "beginner-3",
      text: "Do you have a CODEOWNERS file to assign reviewers for specific files or directories?",
      category: Category.Collaboration,
      tooltipText: "CODEOWNERS files define which teams or individuals are responsible for code in a repository.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners"
    },
    {
      id: "beginner-4",
      text: "Are branch protection rules enabled for your main branch?",
      category: Category.Security,
      tooltipText: "Branch protection rules enforce workflow requirements for pull requests and restrict direct pushes.",
      githubDocsUrl: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches"
    },
    {
      id: "beginner-5",
      text: "Do you use GitHub Actions for basic CI/CD pipelines?",
      category: Category.Automation,
      tooltipText: "GitHub Actions can automate build, test, and deployment workflows in response to events.",
      githubDocsUrl: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions"
    },
    {
      id: "beginner-6",
      text: "Are code reviews mandatory before merging PRs?",
      category: Category.Collaboration,
      tooltipText: "Code reviews help ensure code quality and knowledge sharing across the team.",
      githubDocsUrl: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews"
    },
    {
      id: "beginner-7",
      text: "Do you use GitHub Projects for task and sprint management?",
      category: Category.Collaboration,
      tooltipText: "GitHub Projects provides a flexible way to organize and track work directly in GitHub.",
      githubDocsUrl: "https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects"
    },
    {
      id: "beginner-8",
      text: "Are repository descriptions and README files consistently updated?",
      category: Category.Documentation,
      tooltipText: "Good documentation helps new team members understand projects and reduces onboarding time.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
    },
    {
      id: "beginner-9",
      text: "Do you use labels and milestones to organize Issues and PRs?",
      category: Category.Collaboration,
      tooltipText: "Labels and milestones help categorize and track progress on issues and pull requests.",
      githubDocsUrl: "https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-labels"
    },
    {
      id: "beginner-10",
      text: "Are forks or branches used for contributing to repositories?",
      category: Category.Collaboration,
      tooltipText: "Using branches or forks for contributions helps maintain a clean main branch.",
      githubDocsUrl: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models"
    },
    {
      id: "beginner-11",
      text: "Do you use GitHub Discussions for team collaboration?",
      category: Category.Collaboration,
      tooltipText: "GitHub Discussions provide a community forum for conversations outside of issues.",
      githubDocsUrl: "https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions"
    },
    {
      id: "beginner-12",
      text: "Are repository permissions configured to limit access appropriately?",
      category: Category.Security,
      tooltipText: "Properly configured permissions ensure team members have appropriate access levels.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository"
    },
    {
      id: "beginner-13",
      text: "Do you use GitHub's built-in wiki for documentation?",
      category: Category.Documentation,
      tooltipText: "GitHub Wikis provide a place to host detailed documentation for your project.",
      githubDocsUrl: "https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis"
    },
    {
      id: "beginner-14",
      text: "Are dependencies managed using GitHub's dependency graph?",
      category: Category.Security,
      tooltipText: "The dependency graph helps track your project's dependencies and vulnerabilities.",
      githubDocsUrl: "https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph"
    },
    {
      id: "beginner-15",
      text: "Do you use GitHub's code search to navigate large codebases?",
      category: Category.Collaboration,
      tooltipText: "GitHub's code search features help find and navigate code efficiently.",
      githubDocsUrl: "https://docs.github.com/en/search-github/github-code-search/about-github-code-search"
    },
    {
      id: "beginner-16",
      text: "Are repository templates used to standardize new projects?",
      category: Category.Automation,
      tooltipText: "Repository templates allow you to create repositories with predefined structures.",
      githubDocsUrl: "https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository"
    },
    {
      id: "beginner-17",
      text: "Do you use GitHub's mobile app for on-the-go updates?",
      category: Category.Collaboration,
      tooltipText: "GitHub's mobile app allows you to stay updated and collaborate from your mobile device.",
      githubDocsUrl: "https://docs.github.com/en/get-started/using-github/github-mobile"
    },
    {
      id: "beginner-18",
      text: "Are repository insights (e.g., traffic, contributors) regularly reviewed?",
      category: Category.Collaboration,
      tooltipText: "Repository insights provide data to help understand and improve your project.",
      githubDocsUrl: "https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository"
    },
    {
      id: "beginner-19",
      text: "Do you use GitHub's saved replies for common PR comments?",
      category: Category.Automation,
      tooltipText: "Saved replies help provide consistent feedback during code reviews.",
      githubDocsUrl: "https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies/about-saved-replies"
    },
    {
      id: "beginner-20",
      text: "Are repository licenses included to clarify usage rights?",
      category: Category.Compliance,
      tooltipText: "A license file clarifies how others can use, modify, and distribute your code.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"
    }
  ],
  [StartupStage.Intermediate]: [
    {
      id: "intermediate-1",
      text: "Do you use GitHub Advanced Security features (e.g., secret scanning, dependency review)?",
      category: Category.Security,
      tooltipText: "GitHub Advanced Security provides tools to identify and fix vulnerabilities in your code.",
      githubDocsUrl: "https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security"
    },
    {
      id: "intermediate-2",
      text: "Are CodeQL analyses integrated into your CI/CD pipelines?",
      category: Category.Security,
      tooltipText: "CodeQL can find vulnerabilities in your code through semantic code analysis.",
      githubDocsUrl: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning-with-codeql"
    },
    {
      id: "intermediate-3",
      text: "Do you use GitHub Copilot for code suggestions and automation?",
      category: Category.Automation,
      tooltipText: "GitHub Copilot uses AI to suggest code and entire functions in real-time.",
      githubDocsUrl: "https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot"
    },
    {
      id: "intermediate-4",
      text: "Are Copilot suggestions reviewed for security and compliance?",
      category: Category.Security,
      tooltipText: "Reviewing Copilot suggestions helps ensure they meet security and compliance standards.",
      githubDocsUrl: "https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot#about-the-security-of-github-copilot-suggestions"
    },
    {
      id: "intermediate-5",
      text: "Do you use GitHub Actions to automate testing and deployments?",
      category: Category.Automation,
      tooltipText: "GitHub Actions can automate complex workflows for testing and deployment.",
      githubDocsUrl: "https://docs.github.com/en/actions/deployment/about-deployments"
    },
    {
      id: "intermediate-6",
      text: "Are self-hosted runners used for Actions in private environments?",
      category: Category.Automation,
      tooltipText: "Self-hosted runners allow you to run GitHub Actions in your own environment.",
      githubDocsUrl: "https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners"
    },
    {
      id: "intermediate-7",
      text: "Do you use GitHub Packages for private artifact storage?",
      category: Category.Automation,
      tooltipText: "GitHub Packages provides a secure place to store and share packages with your team.",
      githubDocsUrl: "https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages"
    },
    {
      id: "intermediate-8",
      text: "Are Environments and deployment protection rules configured in Actions?",
      category: Category.Security,
      tooltipText: "Environment protection rules provide additional security for deployments.",
      githubDocsUrl: "https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment"
    },
    {
      id: "intermediate-9",
      text: "Do you use GitHub's code scanning to identify vulnerabilities?",
      category: Category.Security,
      tooltipText: "Code scanning helps find security vulnerabilities and quality issues in your code.",
      githubDocsUrl: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning"
    },
    {
      id: "intermediate-10",
      text: "Are custom Actions shared across teams or in the Marketplace?",
      category: Category.Automation,
      tooltipText: "Sharing custom Actions promotes reuse and consistency across teams.",
      githubDocsUrl: "https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace"
    },
    {
      id: "intermediate-11",
      text: "Do you use GitHub's security advisories to track vulnerabilities?",
      category: Category.Security,
      tooltipText: "Security advisories help you track and manage security vulnerabilities in your projects.",
      githubDocsUrl: "https://docs.github.com/en/code-security/security-advisories/repository-security-advisories/about-repository-security-advisories"
    },
    {
      id: "intermediate-12",
      text: "Are PRs automatically assigned to reviewers based on CODEOWNERS?",
      category: Category.Automation,
      tooltipText: "CODEOWNERS can automatically assign reviewers to pull requests.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners"
    },
    {
      id: "intermediate-13",
      text: "Do you use GitHub's auto-merge feature for approved PRs?",
      category: Category.Automation,
      tooltipText: "Auto-merge can automatically merge pull requests once they meet requirements.",
      githubDocsUrl: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request"
    },
    {
      id: "intermediate-14",
      text: "Are repository templates shared across the organization?",
      category: Category.Automation,
      tooltipText: "Organization-wide templates promote consistency across projects.",
      githubDocsUrl: "https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository"
    },
    {
      id: "intermediate-15",
      text: "Do you use GitHub's code owners to enforce review policies?",
      category: Category.Compliance,
      tooltipText: "Code owners help enforce code review policies for critical code.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners"
    },
    {
      id: "intermediate-16",
      text: "Are repository insights used to track team productivity?",
      category: Category.Collaboration,
      tooltipText: "Repository insights provide data on team activity and productivity.",
      githubDocsUrl: "https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository"
    },
    {
      id: "intermediate-17",
      text: "Do you use GitHub's dependency graph to monitor outdated packages?",
      category: Category.Security,
      tooltipText: "The dependency graph helps identify outdated or vulnerable dependencies.",
      githubDocsUrl: "https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph"
    },
    {
      id: "intermediate-18",
      text: "Are GitHub Apps or Marketplace integrations used (e.g., Slack, Jira)?",
      category: Category.Collaboration,
      tooltipText: "GitHub integrations help connect your workflow with other tools.",
      githubDocsUrl: "https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
    },
    {
      id: "intermediate-19",
      text: "Do you use GitHub's saved replies for common PR feedback?",
      category: Category.Automation,
      tooltipText: "Saved replies help provide consistent feedback during code reviews.",
      githubDocsUrl: "https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies/about-saved-replies"
    },
    {
      id: "intermediate-20",
      text: "Are repository permissions reviewed regularly for compliance?",
      category: Category.Compliance,
      tooltipText: "Regular permission reviews help maintain security and compliance.",
      githubDocsUrl: "https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-roles-for-an-organization"
    }
  ],
  [StartupStage.Advanced]: [
    {
      id: "advanced-1",
      text: "Do you use GitHub Enterprise for organization-wide governance?",
      category: Category.Compliance,
      tooltipText: "GitHub Enterprise provides additional governance and compliance features.",
      githubDocsUrl: "https://docs.github.com/en/enterprise-cloud@latest/admin/overview/about-github-enterprise-cloud"
    },
    {
      id: "advanced-2",
      text: "Are SAML single sign-on (SSO) and SCIM enabled for user management?",
      category: Category.Security,
      tooltipText: "SAML SSO and SCIM provide centralized identity management.",
      githubDocsUrl: "https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-saml-single-sign-on-for-your-organization/about-identity-and-access-management-with-saml-single-sign-on"
    },
    {
      id: "advanced-3",
      text: "Do you use GitHub Codespaces for cloud-based development environments?",
      category: Category.Automation,
      tooltipText: "Codespaces provide consistent, cloud-based development environments.",
      githubDocsUrl: "https://docs.github.com/en/codespaces/overview"
    },
    {
      id: "advanced-4",
      text: "Are Codespaces pre-configured with team-specific tools and extensions?",
      category: Category.Automation,
      tooltipText: "Pre-configured Codespaces help standardize development environments.",
      githubDocsUrl: "https://docs.github.com/en/codespaces/customizing-your-codespace/personalizing-github-codespaces-for-your-account"
    },
    {
      id: "advanced-5",
      text: "Do you use GitHub Copilot extensions for IDE integrations?",
      category: Category.Automation,
      tooltipText: "Copilot extensions enhance development experience across different IDEs.",
      githubDocsUrl: "https://docs.github.com/en/copilot/getting-started-with-github-copilot"
    },
    {
      id: "advanced-6",
      text: "Are Copilot Chat or AI-powered PR reviews enabled?",
      category: Category.Automation,
      tooltipText: "Copilot Chat and AI-powered reviews enhance development with conversational AI.",
      githubDocsUrl: "https://docs.github.com/en/copilot/github-copilot-chat/about-github-copilot-chat"
    },
    {
      id: "advanced-7",
      text: "Do you use GitHub's Advanced Security for custom query suites in CodeQL?",
      category: Category.Security,
      tooltipText: "Custom CodeQL queries help find organization-specific security issues.",
      githubDocsUrl: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/customizing-code-scanning"
    },
    {
      id: "advanced-8",
      text: "Are repository rulesets configured for branch and tag management?",
      category: Category.Security,
      tooltipText: "Repository rulesets provide flexible controls for branch and tag management.",
      githubDocsUrl: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets"
    },
    {
      id: "advanced-9",
      text: "Do you use GitHub's audit log to track organization activity?",
      category: Category.Compliance,
      tooltipText: "Audit logs provide detailed records of organization activity for compliance.",
      githubDocsUrl: "https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization"
    },
    {
      id: "advanced-10",
      text: "Are custom GitHub Actions shared across the enterprise?",
      category: Category.Automation,
      tooltipText: "Enterprise-wide Actions promote consistency and reduce duplication.",
      githubDocsUrl: "https://docs.github.com/en/actions/creating-actions/sharing-actions-and-workflows-with-your-enterprise"
    },
    {
      id: "advanced-11",
      text: "Do you use GitHub's secret scanning to monitor for exposed credentials?",
      category: Category.Security,
      tooltipText: "Secret scanning automatically detects exposed secrets in your repositories.",
      githubDocsUrl: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning"
    },
    {
      id: "advanced-12",
      text: "Are repository templates standardized across the enterprise?",
      category: Category.Automation,
      tooltipText: "Enterprise-wide templates ensure consistency across all repositories.",
      githubDocsUrl: "https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository"
    },
    {
      id: "advanced-13",
      text: "Do you use GitHub's dependency review to block vulnerable dependencies?",
      category: Category.Security,
      tooltipText: "Dependency review helps prevent the introduction of vulnerable dependencies.",
      githubDocsUrl: "https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review"
    },
    {
      id: "advanced-14",
      text: "Are GitHub Insights used to measure engineering efficiency?",
      category: Category.Collaboration,
      tooltipText: "GitHub Insights provide data to measure and improve team productivity.",
      githubDocsUrl: "https://docs.github.com/en/rest/metrics/community"
    },
    {
      id: "advanced-15",
      text: "Do you use GitHub's code scanning to enforce security policies?",
      category: Category.Security,
      tooltipText: "Code scanning can enforce security policies across your organization.",
      githubDocsUrl: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning-for-a-repository"
    },
    {
      id: "advanced-16",
      text: "Are GitHub Packages used for private container registries?",
      category: Category.Automation,
      tooltipText: "GitHub Packages can host your container images for private use.",
      githubDocsUrl: "https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry"
    },
    {
      id: "advanced-17",
      text: "Do you use GitHub's REST or GraphQL API for custom integrations?",
      category: Category.Automation,
      tooltipText: "GitHub's APIs enable custom integrations with your existing tools and workflows.",
      githubDocsUrl: "https://docs.github.com/en/rest"
    },
    {
      id: "advanced-18",
      text: "Are agentic workflows (e.g., AI-powered bots) used for automation?",
      category: Category.Automation,
      tooltipText: "AI-powered bots and workflows automate complex tasks across repositories.",
      githubDocsUrl: "https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps"
    },
    {
      id: "advanced-19",
      text: "Do you use GitHub's roadmap and project planning features?",
      category: Category.Collaboration,
      tooltipText: "GitHub Projects provides advanced planning and roadmap features.",
      githubDocsUrl: "https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects"
    },
    {
      id: "advanced-20",
      text: "Are repository permissions audited regularly for compliance?",
      category: Category.Compliance,
      tooltipText: "Regular permission audits help maintain security and compliance standards.",
      githubDocsUrl: "https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-roles-for-an-organization"
    }
  ]
};

// Helper function to calculate score from 1-4 for a given question
export const calculateCategoryScores = (responses: Record<string, number>): Record<Category, number> => {
  const categoryCounts: Record<Category, { total: number; count: number }> = {
    [Category.Security]: { total: 0, count: 0 },
    [Category.Collaboration]: { total: 0, count: 0 },
    [Category.Automation]: { total: 0, count: 0 },
    [Category.Compliance]: { total: 0, count: 0 },
    [Category.Testing]: { total: 0, count: 0 },
    [Category.Documentation]: { total: 0, count: 0 }
  };

  // Find all questions from all stages and compute scores
  Object.values(StartupStage).forEach(stage => {
    questions[stage].forEach(question => {
      const response = responses[question.id];
      if (response) {
        categoryCounts[question.category].total += response;
        categoryCounts[question.category].count += 1;
      }
    });
  });

  // Calculate average scores
  const categoryScores: Record<Category, number> = {} as Record<Category, number>;
  Object.entries(categoryCounts).forEach(([category, { total, count }]) => {
    categoryScores[category as Category] = count > 0 ? total / count : 0;
  });

  return categoryScores;
}; 