/**
 * Repository Health API
 * 
 * This module provides API endpoints for the repository health assessment functionality.
 */

import express, { Request, Response } from 'express';
import { repositoryHealthController } from '../controllers/repositoryHealthController';

// Create router
const router = express.Router();

/**
 * @route   GET /api/health/assess/:owner/:repo
 * @desc    Assess a repository's health
 * @access  Public
 */
router.get('/assess/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repository name are required' });
    }
    
    // Perform assessment
    const assessment = await repositoryHealthController.assessRepository(owner, repo);
    
    // Save to history
    repositoryHealthController.saveAssessmentToHistory(owner, repo, assessment);
    
    // Return assessment
    return res.json(assessment);
  } catch (error) {
    console.error('Error in /assess endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/enhanced/:owner/:repo
 * @desc    Get enhanced assessment with AI-powered recommendations
 * @access  Public
 */
router.get('/enhanced/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repository name are required' });
    }
    
    // Get enhanced assessment
    const enhancedAssessment = await repositoryHealthController.getEnhancedAssessment(owner, repo);
    
    // Return enhanced assessment
    return res.json(enhancedAssessment);
  } catch (error) {
    console.error('Error in /enhanced endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/visualization/:owner/:repo
 * @desc    Get visualization data for a repository
 * @access  Public
 */
router.get('/visualization/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repository name are required' });
    }
    
    // Perform assessment
    const assessment = await repositoryHealthController.assessRepository(owner, repo);
    
    // Get visualization data
    const visualizationData = repositoryHealthController.getVisualizationData(assessment);
    
    // Return visualization data
    return res.json(visualizationData);
  } catch (error) {
    console.error('Error in /visualization endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/implementation-plan/:owner/:repo
 * @desc    Get implementation plan visualization data
 * @access  Public
 */
router.get('/implementation-plan/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repository name are required' });
    }
    
    // Get enhanced assessment
    const enhancedAssessment = await repositoryHealthController.getEnhancedAssessment(owner, repo);
    
    // Get implementation plan visualization
    const implementationPlan = repositoryHealthController.getImplementationPlanVisualization(enhancedAssessment);
    
    // Return implementation plan
    return res.json(implementationPlan);
  } catch (error) {
    console.error('Error in /implementation-plan endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/badges/:owner/:repo
 * @desc    Get health badges for a repository
 * @access  Public
 */
router.get('/badges/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repository name are required' });
    }
    
    // Perform assessment
    const assessment = await repositoryHealthController.assessRepository(owner, repo);
    
    // Generate badges
    const badges = repositoryHealthController.generateHealthBadges(owner, repo, assessment);
    
    // Return badges
    return res.json(badges);
  } catch (error) {
    console.error('Error in /badges endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/embed/:owner/:repo
 * @desc    Get embeddable HTML for repository health visualization
 * @access  Public
 */
router.get('/embed/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repository name are required' });
    }
    
    // Perform assessment
    const assessment = await repositoryHealthController.assessRepository(owner, repo);
    
    // Generate embeddable HTML
    const html = repositoryHealthController.generateEmbeddableHtml(owner, repo, assessment);
    
    // Return HTML
    return res.send(html);
  } catch (error) {
    console.error('Error in /embed endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/workflows
 * @desc    Get available GitHub Actions workflow templates
 * @access  Public
 */
router.get('/workflows', (req: Request, res: Response) => {
  try {
    // Get workflow templates
    const templates = repositoryHealthController.getWorkflowTemplates();
    
    // Return templates
    return res.json(templates);
  } catch (error) {
    console.error('Error in /workflows endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/workflows/category/:category
 * @desc    Get workflow templates by category
 * @access  Public
 */
router.get('/workflows/category/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['security', 'reliability', 'maintainability', 'collaboration', 'velocity'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: `Invalid category. Valid categories are: ${validCategories.join(', ')}` 
      });
    }
    
    // Get workflow templates by category
    const templates = repositoryHealthController.getWorkflowTemplatesByCategory(
      category as 'security' | 'reliability' | 'maintainability' | 'collaboration' | 'velocity'
    );
    
    // Return templates
    return res.json(templates);
  } catch (error) {
    console.error('Error in /workflows/category endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/workflows/recommendation/:id
 * @desc    Get workflow templates for a specific recommendation
 * @access  Public
 */
router.get('/workflows/recommendation/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get workflow templates for recommendation
    const templates = repositoryHealthController.getWorkflowTemplatesForRecommendation(id);
    
    // Return templates
    return res.json(templates);
  } catch (error) {
    console.error('Error in /workflows/recommendation endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   POST /api/health/workflows/deploy
 * @desc    Deploy a workflow to a repository
 * @access  Public
 */
router.post('/workflows/deploy', async (req: Request, res: Response) => {
  try {
    const { owner, repo, templateId, createPullRequest = true } = req.body;
    
    // Validate input
    if (!owner || !repo || !templateId) {
      return res.status(400).json({ 
        error: 'Owner, repository name, and template ID are required' 
      });
    }
    
    // Deploy workflow
    const result = await repositoryHealthController.deployWorkflow(
      owner,
      repo,
      templateId,
      createPullRequest
    );
    
    // Return result
    return res.json(result);
  } catch (error) {
    console.error('Error in /workflows/deploy endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   POST /api/health/implement
 * @desc    Implement a recommendation using GitHub Actions
 * @access  Public
 */
router.post('/implement', async (req: Request, res: Response) => {
  try {
    const { owner, repo, recommendationId, createPullRequest = true } = req.body;
    
    // Validate input
    if (!owner || !repo || !recommendationId) {
      return res.status(400).json({ 
        error: 'Owner, repository name, and recommendation ID are required' 
      });
    }
    
    // Implement recommendation
    const result = await repositoryHealthController.implementRecommendation(
      owner,
      repo,
      recommendationId,
      createPullRequest
    );
    
    // Return result
    return res.json(result);
  } catch (error) {
    console.error('Error in /implement endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   POST /api/health/implement-multiple
 * @desc    Implement multiple recommendations at once
 * @access  Public
 */
router.post('/implement-multiple', async (req: Request, res: Response) => {
  try {
    const { owner, repo, recommendationIds, createPullRequest = true } = req.body;
    
    // Validate input
    if (!owner || !repo || !recommendationIds || !Array.isArray(recommendationIds)) {
      return res.status(400).json({ 
        error: 'Owner, repository name, and an array of recommendation IDs are required' 
      });
    }
    
    // Implement recommendations
    const results = await repositoryHealthController.implementMultipleRecommendations(
      owner,
      repo,
      recommendationIds,
      createPullRequest
    );
    
    // Return results
    return res.json(results);
  } catch (error) {
    console.error('Error in /implement-multiple endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

/**
 * @route   GET /api/health/compare/:repo1Owner/:repo1Name/:repo2Owner/:repo2Name
 * @desc    Compare two repositories
 * @access  Public
 */
router.get('/compare/:repo1Owner/:repo1Name/:repo2Owner/:repo2Name', async (req: Request, res: Response) => {
  try {
    const { repo1Owner, repo1Name, repo2Owner, repo2Name } = req.params;
    
    // Validate input
    if (!repo1Owner || !repo1Name || !repo2Owner || !repo2Name) {
      return res.status(400).json({ 
        error: 'Owner and name for both repositories are required' 
      });
    }
    
    // Compare repositories
    const comparison = await repositoryHealthController.compareRepositories(
      repo1Owner,
      repo1Name,
      repo2Owner,
      repo2Name
    );
    
    // Return comparison
    return res.json(comparison);
  } catch (error) {
    console.error('Error in /compare endpoint:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

// Export router
export default router; 