import { Category } from '../data/questions';

// Define eligibility criteria for GitHub for Startups program
export interface EligibilityCriteria {
  name: string;
  description: string;
  minimumScores: Partial<Record<Category, number>>;
  overallMinimum: number;
  benefits: string[];
}

// Define eligibility levels
export enum EligibilityLevel {
  NotEligible = "Not Eligible",
  Eligible = "Eligible"
}

// Define GitHub for Startups program tiers
export const githubStartupsTiers: EligibilityCriteria[] = [
  {
    name: "GitHub for Startups",
    description: "Access to GitHub Enterprise and Advanced Security for qualified startups",
    minimumScores: {
      [Category.Security]: 2.0,
      [Category.Collaboration]: 2.0
    },
    overallMinimum: 2.0,
    benefits: [
      "GitHub Enterprise: Up to 20 seats free for the first year",
      "GitHub Advanced Security: 50% off in year one",
      "Access to GitHub Community Forum",
      "Technical guidance and resources",
      "Optional 50% off in year two"
    ]
  }
];

// Calculate eligibility for GitHub for Startups program
export const calculateEligibility = (
  categoryScores: Record<Category, number>,
  companyInfo?: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  }
): {
  level: EligibilityLevel;
  eligibleFor: EligibilityCriteria[];
  improvements: Array<{
    category: Category;
    currentScore: number;
    requiredScore: number;
    tier: string;
  }>;
  isEligibleForProgram: boolean;
  ineligibilityReasons: string[];
} => {
  // Calculate overall average score
  const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 
    Object.values(categoryScores).length;
  
  // Check eligibility for each tier
  const eligibleFor: EligibilityCriteria[] = [];
  const improvements: Array<{
    category: Category;
    currentScore: number;
    requiredScore: number;
    tier: string;
  }> = [];
  
  const ineligibilityReasons: string[] = [];
  
  // Check if eligible for GitHub for Startups program based on company info
  // Default to false if no company info provided
  let isEligibleForProgram = false;
  
  if (companyInfo) {
    // Check funding stage - must be Series B or earlier
    const eligibleFundingStages = ['pre-seed', 'seed', 'series a', 'series b', 'bootstrapped'];
    const fundingStageEligible = companyInfo.fundingStage && 
      eligibleFundingStages.includes(companyInfo.fundingStage.toLowerCase());
    
    if (!fundingStageEligible && companyInfo.fundingStage) {
      ineligibilityReasons.push("Your company must be Series B or earlier to qualify");
    }
    
    // Check if net new to GitHub Enterprise/Advanced Security
    const isNetNew = (!companyInfo.usingGitHubEnterprise && !companyInfo.usingAdvancedSecurity) || 
      (companyInfo.timeWithGitHub === 'less than 6 months');
    
    if (!isNetNew && (companyInfo.usingGitHubEnterprise || companyInfo.usingAdvancedSecurity)) {
      ineligibilityReasons.push("Your company must be new to GitHub Enterprise or Advanced Security (within the last 6 months)");
    }
    
    // Check team size - typically for startups with fewer than 100 employees
    const teamSizeEligible = !companyInfo.employeeCount || companyInfo.employeeCount <= 100;
    
    if (!teamSizeEligible) {
      ineligibilityReasons.push("Your company should have 100 or fewer employees to qualify");
    }
    
    // Overall eligibility
    isEligibleForProgram = Boolean(fundingStageEligible && isNetNew && teamSizeEligible);
  }
  
  // Check GitHub practices scores
  const tier = githubStartupsTiers[0]; // We only have one tier now
  let practicesEligible = true;
  
  // Check if overall score meets minimum
  if (overallScore < tier.overallMinimum) {
    practicesEligible = false;
    
    // Add overall improvement needed
    improvements.push({
      category: Category.Security, // Placeholder for overall
      currentScore: overallScore,
      requiredScore: tier.overallMinimum,
      tier: tier.name
    });
  }
  
  // Check each category minimum
  for (const [category, minScore] of Object.entries(tier.minimumScores)) {
    const currentScore = categoryScores[category as Category] || 0;
    
    if (currentScore < minScore) {
      practicesEligible = false;
      
      // Add category improvement needed
      improvements.push({
        category: category as Category,
        currentScore,
        requiredScore: minScore,
        tier: tier.name
      });
    }
  }
  
  if (isEligibleForProgram && practicesEligible) {
    eligibleFor.push(tier);
  }
  
  // Determine eligibility level
  const level = eligibleFor.length > 0 ? EligibilityLevel.Eligible : EligibilityLevel.NotEligible;
  
  return {
    level,
    eligibleFor,
    improvements,
    isEligibleForProgram,
    ineligibilityReasons
  };
};

// Generate detailed improvement roadmap
export const generateImprovementRoadmap = (
  categoryScores: Record<Category, number>,
  companyInfo?: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  }
): Array<{
  category: Category;
  currentScore: number;
  targetScore: number;
  actionItems: string[];
  resources: { title: string; url: string }[];
}> => {
  const { improvements } = calculateEligibility(categoryScores, companyInfo);
  
  return improvements.map(improvement => {
    const actionItems = getActionItemsForCategory(improvement.category, improvement.currentScore);
    const resources = getResourcesForCategory(improvement.category);
    
    return {
      ...improvement,
      targetScore: improvement.requiredScore,
      actionItems,
      resources
    };
  });
};

// Get action items for a specific category based on current score
const getActionItemsForCategory = (category: Category, currentScore: number): string[] => {
  switch (category) {
    case Category.Security:
      if (currentScore < 1.5) {
        return [
          "Enable branch protection rules for your main branch",
          "Add a SECURITY.md file to your repository",
          "Set up Dependabot alerts for vulnerable dependencies"
        ];
      } else if (currentScore < 2.5) {
        return [
          "Implement code scanning with CodeQL",
          "Set up secret scanning to prevent credential leaks",
          "Create a security policy for your organization"
        ];
      } else {
        return [
          "Implement advanced security policies",
          "Set up regular security audits",
          "Create a security incident response plan"
        ];
      }
    
    case Category.Collaboration:
      if (currentScore < 1.5) {
        return [
          "Create pull request templates",
          "Implement a branching strategy (e.g., GitHub Flow)",
          "Set up required reviews for pull requests"
        ];
      } else if (currentScore < 2.5) {
        return [
          "Use draft pull requests for work in progress",
          "Implement code owners for critical files",
          "Create project boards to track work"
        ];
      } else {
        return [
          "Set up team discussions for important decisions",
          "Create contribution guidelines",
          "Implement issue templates for bug reports and feature requests"
        ];
      }
    
    case Category.Automation:
      if (currentScore < 1.5) {
        return [
          "Set up basic CI/CD with GitHub Actions",
          "Automate dependency updates with Dependabot",
          "Create a workflow for automated testing"
        ];
      } else if (currentScore < 2.5) {
        return [
          "Implement deployment workflows",
          "Set up automated code quality checks",
          "Create reusable workflow templates"
        ];
      } else {
        return [
          "Implement matrix builds for multiple platforms",
          "Set up environment-specific deployments",
          "Create custom GitHub Actions for your specific needs"
        ];
      }
    
    case Category.Testing:
      if (currentScore < 1.5) {
        return [
          "Set up basic unit testing",
          "Implement test coverage reporting",
          "Create a workflow to run tests on pull requests"
        ];
      } else if (currentScore < 2.5) {
        return [
          "Implement integration testing",
          "Set up end-to-end testing",
          "Create test environments with GitHub Environments"
        ];
      } else {
        return [
          "Implement performance testing",
          "Set up chaos testing",
          "Create a comprehensive test strategy"
        ];
      }
    
    case Category.Compliance:
      if (currentScore < 1.5) {
        return [
          "Add a LICENSE file to your repository",
          "Create a basic code of conduct",
          "Document your compliance requirements"
        ];
      } else if (currentScore < 2.5) {
        return [
          "Implement license compliance checking",
          "Set up audit logs for compliance tracking",
          "Create compliance documentation"
        ];
      } else {
        return [
          "Implement automated compliance checks",
          "Set up regular compliance audits",
          "Create a compliance dashboard"
        ];
      }
    
    case Category.Documentation:
      if (currentScore < 1.5) {
        return [
          "Create a comprehensive README.md",
          "Document installation and setup procedures",
          "Add inline code documentation"
        ];
      } else if (currentScore < 2.5) {
        return [
          "Set up GitHub Pages for project documentation",
          "Create user guides and tutorials",
          "Document your API with OpenAPI or similar"
        ];
      } else {
        return [
          "Implement versioned documentation",
          "Create architecture diagrams",
          "Set up automated documentation generation"
        ];
      }
    
    default:
      return [
        "Review GitHub best practices",
        "Implement GitHub's recommended workflows",
        "Consult GitHub documentation for improvement ideas"
      ];
  }
};

// Get resources for a specific category
const getResourcesForCategory = (category: Category): Array<{ title: string; url: string }> => {
  switch (category) {
    case Category.Security:
      return [
        { 
          title: "GitHub Security Best Practices", 
          url: "https://docs.github.com/en/code-security/getting-started/github-security-best-practices" 
        },
        { 
          title: "Setting up code scanning", 
          url: "https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/setting-up-code-scanning-for-a-repository" 
        },
        { 
          title: "About secret scanning", 
          url: "https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning" 
        }
      ];
    
    case Category.Collaboration:
      return [
        { 
          title: "GitHub Flow", 
          url: "https://docs.github.com/en/get-started/quickstart/github-flow" 
        },
        { 
          title: "Creating a pull request template", 
          url: "https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository" 
        },
        { 
          title: "About code owners", 
          url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners" 
        }
      ];
    
    case Category.Automation:
      return [
        { 
          title: "GitHub Actions quickstart", 
          url: "https://docs.github.com/en/actions/quickstart" 
        },
        { 
          title: "About continuous integration", 
          url: "https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration" 
        },
        { 
          title: "Automating Dependabot", 
          url: "https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions" 
        }
      ];
    
    case Category.Testing:
      return [
        { 
          title: "Building and testing with GitHub Actions", 
          url: "https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs" 
        },
        { 
          title: "Using environments for deployment", 
          url: "https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment" 
        },
        { 
          title: "Test strategy best practices", 
          url: "https://github.blog/2021-05-01-test-strategy-for-github-cli/" 
        }
      ];
    
    case Category.Compliance:
      return [
        { 
          title: "Adding a license to a repository", 
          url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository" 
        },
        { 
          title: "About audit logs", 
          url: "https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization" 
        },
        { 
          title: "GitHub's site policies", 
          url: "https://docs.github.com/en/site-policy" 
        }
      ];
    
    case Category.Documentation:
      return [
        { 
          title: "About READMEs", 
          url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes" 
        },
        { 
          title: "GitHub Pages documentation", 
          url: "https://docs.github.com/en/pages" 
        },
        { 
          title: "Documenting your projects", 
          url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-wikis" 
        }
      ];
    
    default:
      return [
        { 
          title: "GitHub Documentation", 
          url: "https://docs.github.com" 
        },
        { 
          title: "GitHub Skills", 
          url: "https://skills.github.com/" 
        },
        { 
          title: "GitHub Blog", 
          url: "https://github.blog" 
        }
      ];
  }
}; 