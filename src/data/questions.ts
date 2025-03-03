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
  Seed = "Seed/Earlier",
  SeriesA = "Series A",
  SeriesB = "Series B+"
}

// Sample questions for each startup stage
export const questions: Record<StartupStage, Question[]> = {
  [StartupStage.Seed]: [
    {
      id: "seed-1",
      text: "Do you have a consistent branch strategy (e.g. git-flow, GitHub flow)?",
      category: Category.Collaboration,
      tooltipText: "A defined workflow helps teams collaborate on code changes efficiently.",
      githubDocsUrl: "https://docs.github.com/en/get-started/quickstart/github-flow"
    },
    {
      id: "seed-2",
      text: "Are you using pull requests for code reviews?",
      category: Category.Collaboration,
      tooltipText: "Pull requests facilitate team review of code changes before merging.",
      githubDocsUrl: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"
    },
    {
      id: "seed-3",
      text: "Do you have a CI/CD pipeline set up with GitHub Actions?",
      category: Category.Automation,
      tooltipText: "Automating your build, test, and deployment processes saves time and reduces errors.",
      githubDocsUrl: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions"
    },
    {
      id: "seed-4",
      text: "Are you using Dependabot to manage package dependencies?",
      category: Category.Security,
      tooltipText: "Dependabot can automatically update dependencies with security vulnerabilities.",
      githubDocsUrl: "https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates"
    },
    {
      id: "seed-5",
      text: "Do you have a well-structured README file?",
      category: Category.Documentation,
      tooltipText: "A good README helps new team members onboard quickly.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
    },
    {
      id: "seed-6",
      text: "Are you writing automated tests for your code?",
      category: Category.Testing,
      tooltipText: "Automated tests help catch bugs early and provide confidence when making changes.",
      githubDocsUrl: "https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration"
    },
    {
      id: "seed-7",
      text: "Are your repository secrets stored securely?",
      category: Category.Security,
      tooltipText: "GitHub offers secure storage for sensitive values like API keys.",
      githubDocsUrl: "https://docs.github.com/en/actions/security-guides/encrypted-secrets"
    },
    {
      id: "seed-8",
      text: "Do you have branch protection rules for your main branch?",
      category: Category.Security,
      tooltipText: "Branch protection prevents direct pushes and ensures code reviews.",
      githubDocsUrl: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches"
    },
    {
      id: "seed-9",
      text: "Are you using GitHub Issues to track bugs and feature requests?",
      category: Category.Collaboration,
      tooltipText: "Issues help organize work and track progress.",
      githubDocsUrl: "https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues"
    },
    {
      id: "seed-10",
      text: "Do you have a license file in your repository?",
      category: Category.Compliance,
      tooltipText: "A license clarifies how others can use your code.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"
    }
  ],
  [StartupStage.SeriesA]: [
    {
      id: "series-a-1",
      text: "Do you enforce code quality standards via CI?",
      category: Category.Automation,
      tooltipText: "Automated code quality checks maintain consistency across your codebase.",
      githubDocsUrl: "https://docs.github.com/en/github/finding-security-vulnerabilities-and-errors-in-your-code/about-code-scanning"
    },
    {
      id: "series-a-2",
      text: "Are you using GitHub's code scanning features?",
      category: Category.Security,
      tooltipText: "Code scanning can identify vulnerabilities before they reach production.",
      githubDocsUrl: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning"
    },
    {
      id: "series-a-3",
      text: "Do you have a defined process for dependency management?",
      category: Category.Security,
      tooltipText: "Regular dependency updates reduce security risks.",
      githubDocsUrl: "https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-supply-chain-security"
    },
    {
      id: "series-a-4",
      text: "Are you using GitHub Projects for tracking development workflows?",
      category: Category.Collaboration,
      tooltipText: "GitHub Projects provides Kanban-style boards for workflow management.",
      githubDocsUrl: "https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects"
    },
    {
      id: "series-a-5",
      text: "Do you have a documented incident response process?",
      category: Category.Security,
      tooltipText: "A clear plan for handling security incidents minimizes impact.",
      githubDocsUrl: "https://docs.github.com/en/code-security/security-advisories/about-coordinated-disclosure-of-security-vulnerabilities"
    },
    {
      id: "series-a-6",
      text: "Are you tracking code coverage for your tests?",
      category: Category.Testing,
      tooltipText: "Code coverage helps identify untested parts of your application.",
      githubDocsUrl: "https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-java-with-maven#caching-dependencies"
    },
    {
      id: "series-a-7",
      text: "Do you have environment-specific deployment workflows?",
      category: Category.Automation,
      tooltipText: "Separate workflows for staging and production improve reliability.",
      githubDocsUrl: "https://docs.github.com/en/actions/deployment/about-deployments"
    },
    {
      id: "series-a-8",
      text: "Are you performing regular dependency audits?",
      category: Category.Security,
      tooltipText: "Regular audits catch vulnerable dependencies early.",
      githubDocsUrl: "https://docs.github.com/en/code-security/dependabot/working-with-dependabot/auditing-dependabot-alerts"
    },
    {
      id: "series-a-9",
      text: "Do you have a contributor guide for your repositories?",
      category: Category.Documentation,
      tooltipText: "Guidance for contributors helps maintain code quality and consistency.",
      githubDocsUrl: "https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors"
    },
    {
      id: "series-a-10",
      text: "Are you using GitHub's security advisories feature?",
      category: Category.Security,
      tooltipText: "Security advisories help you privately discuss and fix vulnerabilities.",
      githubDocsUrl: "https://docs.github.com/en/code-security/security-advisories/about-github-security-advisories"
    }
  ],
  [StartupStage.SeriesB]: [
    {
      id: "series-b-1",
      text: "Do you enforce SAML SSO for your GitHub organization?",
      category: Category.Security,
      tooltipText: "SAML SSO provides centralized authentication for organization access.",
      githubDocsUrl: "https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-saml-single-sign-on-for-your-organization/about-identity-and-access-management-with-saml-single-sign-on"
    },
    {
      id: "series-b-2",
      text: "Are you using GitHub Advanced Security features?",
      category: Category.Security,
      tooltipText: "Advanced Security provides additional security features like secret scanning.",
      githubDocsUrl: "https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security"
    },
    {
      id: "series-b-3",
      text: "Do you have defined SLAs for security vulnerability remediation?",
      category: Category.Security,
      tooltipText: "SLAs ensure timely responses to security issues.",
      githubDocsUrl: "https://docs.github.com/en/code-security/security-advisories/about-github-security-advisories"
    },
    {
      id: "series-b-4",
      text: "Are you using GitHub's audit log for compliance monitoring?",
      category: Category.Compliance,
      tooltipText: "Audit logs provide visibility into organization activity.",
      githubDocsUrl: "https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization"
    },
    {
      id: "series-b-5",
      text: "Do you enforce signed commits?",
      category: Category.Security,
      tooltipText: "Signed commits verify the identity of the contributor.",
      githubDocsUrl: "https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification"
    },
    {
      id: "series-b-6",
      text: "Are you using GitHub's security policies feature?",
      category: Category.Security,
      tooltipText: "Security policies help others understand how to report vulnerabilities.",
      githubDocsUrl: "https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository"
    },
    {
      id: "series-b-7",
      text: "Do you have an automated dependency approval process?",
      category: Category.Automation,
      tooltipText: "Automating dependency approvals speeds up secure development.",
      githubDocsUrl: "https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review"
    },
    {
      id: "series-b-8",
      text: "Are you using GitHub's required status checks?",
      category: Category.Compliance,
      tooltipText: "Required status checks enforce quality standards before merging.",
      githubDocsUrl: "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#require-status-checks-before-merging"
    },
    {
      id: "series-b-9",
      text: "Do you have a documented compliance framework for your codebase?",
      category: Category.Compliance,
      tooltipText: "Documentation helps ensure regulatory compliance across your team.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-repository-languages"
    },
    {
      id: "series-b-10",
      text: "Are you using GitHub's CODEOWNERS feature?",
      category: Category.Collaboration,
      tooltipText: "CODEOWNERS automatically assigns reviewers based on file paths.",
      githubDocsUrl: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners"
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
  
  // Flatten all questions into a single array
  const allQuestions = [
    ...questions[StartupStage.Seed],
    ...questions[StartupStage.SeriesA],
    ...questions[StartupStage.SeriesB]
  ];
  
  // Sum up scores by category
  allQuestions.forEach(question => {
    if (responses[question.id]) {
      categoryCounts[question.category].total += responses[question.id];
      categoryCounts[question.category].count += 1;
    }
  });
  
  // Calculate average score per category (defaulting to 0 if no questions answered)
  const result: Record<Category, number> = {} as Record<Category, number>;
  
  Object.keys(categoryCounts).forEach(category => {
    const categoryKey = category as Category;
    const { total, count } = categoryCounts[categoryKey];
    result[categoryKey] = count > 0 ? total / count : 0;
  });
  
  return result;
}; 