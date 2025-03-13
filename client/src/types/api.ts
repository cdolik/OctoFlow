// Repository health insights
export interface SecurityInsights {
  securityScore: number;
  vulnerabilities: number;
  branchProtectionRules: any[];
  hasSecurityPolicy: boolean;
  secretScanning: boolean;
  dependabotAlerts: number;
  // Add other security metrics as needed
}

export interface ReliabilityInsights {
  reliabilityScore: number;
  cicdSetup: boolean;
  successRate: number;
  workflowRuns: any[];
  // Add other reliability metrics as needed
}

export interface MaintainabilityInsights {
  maintainabilityScore: number;
  hasReadme: boolean;
  readmeQuality: number;
  codeOwners: boolean;
  // Add other maintainability metrics as needed
}

export interface CollaborationInsights {
  collaborationScore: number;
  prTemplates: boolean;
  issueTemplates: boolean;
  avgReviewTime: number;
  // Add other collaboration metrics as needed
}

export interface VelocityInsights {
  velocityScore: number;
  timeToMerge: number;
  prSize: number;
  // Add other velocity metrics as needed
}

export interface RepositoryHealthInsights {
  overallScore: number;
  security: SecurityInsights;
  reliability: ReliabilityInsights;
  maintainability: MaintainabilityInsights;
  collaboration: CollaborationInsights;
  velocity: VelocityInsights;
}

// Recommendations
export interface Recommendation {
  id: string;
  category: 'security' | 'reliability' | 'maintainability' | 'collaboration' | 'velocity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  actionItems: string[];
  resources: { title: string; url: string }[];
  githubActionsUrl?: string;
  settingsUrl?: string;
}

// Assessment Result
export interface AssessmentResult {
  repositoryInsights: RepositoryHealthInsights;
  recommendations: Recommendation[];
  prioritizedRecommendations: Recommendation[];
  quickWins: Recommendation[];
  summary: {
    overallScore: number;
    categoryScores: {
      security: number;
      reliability: number;
      maintainability: number;
      collaboration: number;
      velocity: number;
    };
    strengths: string[];
    weaknesses: string[];
  };
}

// Enhanced recommendations from the AI engine
export interface EnhancedRecommendation extends Recommendation {
  automationPossible: boolean;
  automationScript?: string;
  estimatedTimeToImplement: string;
  businessImpact: string;
  implementationSteps: {
    step: string;
    details: string;
    codeSnippet?: string;
  }[];
}

// Repository context for recommendations
export interface RecommendationContext {
  repositorySize: number;
  primaryLanguage: string;
  teamSize: number;
  isPublic: boolean;
  hasCI: boolean;
  recentActivity: {
    commits: number;
    pullRequests: number;
    issues: number;
  };
}

// Enhanced assessment result from the AI engine
export interface EnhancedAssessmentResult {
  repositoryInsights: RepositoryHealthInsights;
  recommendations: EnhancedRecommendation[];
  prioritizedRecommendations: EnhancedRecommendation[];
  quickWins: EnhancedRecommendation[];
  summary: {
    overallScore: number;
    categoryScores: {
      security: number;
      reliability: number;
      maintainability: number;
      collaboration: number;
      velocity: number;
    };
    strengths: string[];
    weaknesses: string[];
  };
  context: RecommendationContext;
  nextSteps: {
    immediate: EnhancedRecommendation[];
    shortTerm: EnhancedRecommendation[];
    longTerm: EnhancedRecommendation[];
  };
  implementationPlan: {
    title: string;
    description: string;
    steps: {
      name: string;
      recommendations: string[];
      estimatedEffort: string;
      expectedOutcome: string;
    }[];
  };
}

// Visualization Data
export interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface ScoreCardData {
  title: string;
  score: number;
  color: string;
  icon: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
  };
}

export interface TrendChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

export interface RecommendationChartData {
  categories: {
    name: string;
    count: number;
    color: string;
  }[];
  impact: {
    high: number;
    medium: number;
    low: number;
  };
  effort: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface VisualizationData {
  radarChart: RadarChartData;
  scoreCards: ScoreCardData[];
  recommendationChart: RecommendationChartData;
}

// Implementation Plan
export interface ImplementationPlan {
  title: string;
  description: string;
  phases: {
    name: string;
    recommendationCount: number;
    effort: string;
    outcome: string;
  }[];
}

// Health Badges
export interface HealthBadges {
  markdown: string;
  badgeUrls: {
    overall: string;
    security: string;
    reliability: string;
    maintainability: string;
  };
}

// GitHub Actions Workflow Templates
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'reliability' | 'maintainability' | 'collaboration' | 'velocity';
  content: string;
  recommendationIds: string[];
}

// Workflow Deployment Result
export interface WorkflowDeploymentResult {
  success: boolean;
  message: string;
  workflowUrl?: string;
  pullRequestUrl?: string;
} 