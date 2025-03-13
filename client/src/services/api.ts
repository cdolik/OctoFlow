import axios, { AxiosResponse } from 'axios';
import { 
  AssessmentResult, 
  EnhancedAssessmentResult,
  VisualizationData,
  ImplementationPlan,
  HealthBadges,
  WorkflowTemplate,
  WorkflowDeploymentResult
} from '../types/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api/health',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Error handler helper
const handleApiError = (error: any) => {
  if (error.response) {
    // Safely check for error message in response data
    let errorMessage = error.message;
    if (error.response.data) {
      if (typeof error.response.data === 'object' && 'error' in error.response.data) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
    }
    
    throw new Error(`API Error: ${error.response.status} - ${errorMessage}`);
  }
  if (error.request) {
    throw new Error('No response received from server');
  }
  throw new Error('Error setting up the request');
};

// Repository assessment API endpoints
export const repositoryApi = {
  // Assess repository
  assessRepository: async (owner: string, repo: string): Promise<AssessmentResult> => {
    try {
      const response: AxiosResponse<AssessmentResult> = await api.get(`/assess/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get enhanced assessment
  getEnhancedAssessment: async (owner: string, repo: string): Promise<EnhancedAssessmentResult> => {
    try {
      const response: AxiosResponse<EnhancedAssessmentResult> = await api.get(`/enhanced/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get visualization data
  getVisualizationData: async (owner: string, repo: string): Promise<VisualizationData> => {
    try {
      const response: AxiosResponse<VisualizationData> = await api.get(`/visualization/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get implementation plan
  getImplementationPlan: async (owner: string, repo: string): Promise<ImplementationPlan> => {
    try {
      const response: AxiosResponse<ImplementationPlan> = await api.get(`/implementation-plan/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get health badges
  getHealthBadges: async (owner: string, repo: string): Promise<HealthBadges> => {
    try {
      const response: AxiosResponse<HealthBadges> = await api.get(`/badges/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get embeddable HTML
  getEmbeddableHtml: async (owner: string, repo: string): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await api.get(`/embed/${owner}/${repo}`, {
        headers: {
          'Accept': 'text/html',
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Compare repositories
  compareRepositories: async (
    repo1Owner: string, 
    repo1Name: string, 
    repo2Owner: string, 
    repo2Name: string
  ): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await api.get(
        `/compare/${repo1Owner}/${repo1Name}/${repo2Owner}/${repo2Name}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// GitHub Actions API endpoints
export const workflowsApi = {
  // Get all workflow templates
  getAllWorkflowTemplates: async (): Promise<WorkflowTemplate[]> => {
    try {
      const response: AxiosResponse<WorkflowTemplate[]> = await api.get('/workflows');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get workflow templates by category
  getWorkflowTemplatesByCategory: async (category: string): Promise<WorkflowTemplate[]> => {
    try {
      const response: AxiosResponse<WorkflowTemplate[]> = await api.get(`/workflows/category/${category}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get workflow templates for recommendation
  getWorkflowTemplatesForRecommendation: async (recommendationId: string): Promise<WorkflowTemplate[]> => {
    try {
      const response: AxiosResponse<WorkflowTemplate[]> = await api.get(`/workflows/recommendation/${recommendationId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Deploy workflow
  deployWorkflow: async (
    owner: string, 
    repo: string, 
    templateId: string, 
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> => {
    try {
      const response: AxiosResponse<WorkflowDeploymentResult> = await api.post('/workflows/deploy', {
        owner,
        repo,
        templateId,
        createPullRequest
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Implement recommendation
  implementRecommendation: async (
    owner: string, 
    repo: string, 
    recommendationId: string, 
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult> => {
    try {
      const response: AxiosResponse<WorkflowDeploymentResult> = await api.post('/implement', {
        owner,
        repo,
        recommendationId,
        createPullRequest
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Implement multiple recommendations
  implementMultipleRecommendations: async (
    owner: string, 
    repo: string, 
    recommendationIds: string[], 
    createPullRequest: boolean = true
  ): Promise<WorkflowDeploymentResult[]> => {
    try {
      const response: AxiosResponse<WorkflowDeploymentResult[]> = await api.post('/implement-multiple', {
        owner,
        repo,
        recommendationIds,
        createPullRequest
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Create a named export for the API object
const apiService = {
  repository: repositoryApi,
  workflows: workflowsApi
};

export default apiService; 