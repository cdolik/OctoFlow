import React, { useState, useEffect } from 'react';
import { 
  getRepositoryDetails, 
  getRepositoryTopics,
  getRepositoryWorkflows
} from '../services/githubApi';
import { GitHubRepository, GitHubWorkflowsResponse } from '../types/github';

interface RepositoryAnalysisProps {
  repoOwner: string;
  repoName: string;
  onClose: () => void;
}

interface AnalysisResult {
  category: string;
  score: number;
  recommendations: string[];
  details: string;
}

const RepositoryAnalysis: React.FC<RepositoryAnalysisProps> = ({ 
  repoOwner, 
  repoName,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoDetails, setRepoDetails] = useState<GitHubRepository | null>(null);
  const [workflows, setWorkflows] = useState<GitHubWorkflowsResponse['workflows']>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    const fetchRepoData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch repository details
        const details = await getRepositoryDetails(repoOwner, repoName);
        setRepoDetails(details);
        
        // Fetch GitHub Actions workflows
        const workflowsData = await getRepositoryWorkflows(repoOwner, repoName);
        setWorkflows(workflowsData.workflows || []);
        
        // Fetch repository topics
        const topicsData = await getRepositoryTopics(repoOwner, repoName);
        setTopics(topicsData.names || []);
        
      } catch (err) {
        console.error('Error fetching repository data:', err);
        setError('Failed to load repository data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRepoData();
  }, [repoOwner, repoName]);

  // Analyze repository data and generate recommendations
  useEffect(() => {
    if (!repoDetails || loading) return;
    
    const results: AnalysisResult[] = [];
    let totalScore = 0;
    
    // Analyze CI/CD practices
    const cicdScore = calculateCICDScore();
    results.push({
      category: 'CI/CD',
      score: cicdScore,
      recommendations: getCICDRecommendations(cicdScore),
      details: `Found ${workflows.length} workflow files.`
    });
    totalScore += cicdScore;
    
    // Analyze documentation
    const docsScore = calculateDocsScore();
    results.push({
      category: 'Documentation',
      score: docsScore,
      recommendations: getDocsRecommendations(docsScore),
      details: `README: ${repoDetails?.has_readme ? 'Yes' : 'No'}, Wiki: ${repoDetails?.has_wiki ? 'Enabled' : 'Disabled'}`
    });
    totalScore += docsScore;
    
    // Analyze security practices
    const securityScore = calculateSecurityScore();
    results.push({
      category: 'Security',
      score: securityScore,
      recommendations: getSecurityRecommendations(securityScore),
      details: `Security policy: ${repoDetails?.security_and_analysis?.secret_scanning?.status === 'enabled' ? 'Enabled' : 'Not enabled'}`
    });
    totalScore += securityScore;
    
    // Analyze community health
    const communityScore = calculateCommunityScore();
    results.push({
      category: 'Community',
      score: communityScore,
      recommendations: getCommunityRecommendations(communityScore),
      details: `Issues: ${repoDetails?.has_issues ? 'Enabled' : 'Disabled'}, Topics: ${topics.length}`
    });
    totalScore += communityScore;
    
    setAnalysisResults(results);
    setOverallScore(totalScore / results.length);
  }, [repoDetails, workflows, topics]);

  // Calculate scores for different categories
  const calculateCICDScore = (): number => {
    if (workflows.length === 0) return 1;
    if (workflows.length === 1) return 2;
    if (workflows.length >= 2) return 3;
    return 0;
  };
  
  const calculateDocsScore = (): number => {
    let score = 1;
    if (repoDetails?.has_readme) score += 1;
    if (repoDetails?.has_wiki) score += 0.5;
    if (repoDetails?.description && repoDetails.description.length > 20) score += 0.5;
    return Math.min(score, 3);
  };
  
  const calculateSecurityScore = (): number => {
    let score = 1;
    if (repoDetails?.security_and_analysis?.secret_scanning?.status === 'enabled') score += 1;
    if (repoDetails?.security_and_analysis?.advanced_security?.status === 'enabled') score += 1;
    return score;
  };
  
  const calculateCommunityScore = (): number => {
    let score = 1;
    if (repoDetails?.has_issues) score += 0.5;
    if (repoDetails?.has_projects) score += 0.5;
    if (topics.length >= 3) score += 1;
    return Math.min(score, 3);
  };

  // Get recommendations based on scores
  const getCICDRecommendations = (score: number): string[] => {
    if (score < 2) {
      return [
        'Set up GitHub Actions for continuous integration',
        'Add automated testing to your workflow',
        'Implement build validation for pull requests'
      ];
    } else if (score < 3) {
      return [
        'Add deployment workflows to your CI/CD pipeline',
        'Implement code quality checks in your workflows',
        'Set up dependency scanning in your CI process'
      ];
    } else {
      return [
        'Consider adding performance testing to your CI/CD pipeline',
        'Implement environment-specific deployment workflows',
        'Set up automated release notes generation'
      ];
    }
  };
  
  const getDocsRecommendations = (score: number): string[] => {
    if (score < 2) {
      return [
        'Create a comprehensive README.md file',
        'Add installation and usage instructions',
        'Document the project structure'
      ];
    } else if (score < 3) {
      return [
        'Add code examples to your documentation',
        'Create a contributing guide',
        'Set up GitHub wiki for detailed documentation'
      ];
    } else {
      return [
        'Consider adding architecture diagrams',
        'Document your API endpoints',
        'Create troubleshooting guides'
      ];
    }
  };
  
  const getSecurityRecommendations = (score: number): string[] => {
    if (score < 2) {
      return [
        'Enable secret scanning for your repository',
        'Add a SECURITY.md file with security policies',
        'Implement dependency vulnerability scanning'
      ];
    } else if (score < 3) {
      return [
        'Enable GitHub Advanced Security features',
        'Set up code scanning with CodeQL',
        'Implement security-focused code reviews'
      ];
    } else {
      return [
        'Conduct regular security audits',
        'Implement SAST/DAST in your CI/CD pipeline',
        'Set up automated security testing'
      ];
    }
  };
  
  const getCommunityRecommendations = (score: number): string[] => {
    if (score < 2) {
      return [
        'Enable issues for user feedback and bug reports',
        'Add descriptive topics to your repository',
        'Create issue templates for bug reports and feature requests'
      ];
    } else if (score < 3) {
      return [
        'Set up project boards for tracking work',
        'Create a pull request template',
        'Add a code of conduct to your repository'
      ];
    } else {
      return [
        'Set up discussion forums for your community',
        'Create good first issue labels for new contributors',
        'Document your governance model'
      ];
    }
  };

  // Get color based on score
  const getScoreColor = (score: number): string => {
    if (score < 1.5) return 'var(--danger-color)';
    if (score < 2.5) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  if (loading) {
    return <div className="loading">Analyzing repository...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={onClose} className="primary-button">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="repository-analysis">
      <div className="analysis-header">
        <h2>Repository Analysis: {repoName}</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      
      <div className="overall-score">
        <div className="score-circle" style={{ borderColor: getScoreColor(overallScore) }}>
          <span className="score-value">{overallScore.toFixed(1)}</span>
          <span className="score-label">Overall</span>
        </div>
        <div className="score-summary">
          <p>
            {overallScore < 1.5 
              ? 'This repository needs significant improvements to follow GitHub best practices.' 
              : overallScore < 2.5 
                ? 'This repository follows some GitHub best practices but has room for improvement.' 
                : 'This repository follows many GitHub best practices. Great job!'}
          </p>
        </div>
      </div>
      
      <div className="analysis-results">
        {analysisResults.map((result, index) => (
          <div key={index} className="analysis-category">
            <div className="category-header">
              <h3>{result.category}</h3>
              <div className="category-score" style={{ color: getScoreColor(result.score) }}>
                {result.score.toFixed(1)}/3.0
              </div>
            </div>
            
            <p className="category-details">{result.details}</p>
            
            <div className="recommendations">
              <h4>Recommendations:</h4>
              <ul>
                {result.recommendations.map((rec, recIndex) => (
                  <li key={recIndex}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      <div className="analysis-actions">
        <button onClick={onClose} className="primary-button">
          Close Analysis
        </button>
      </div>
    </div>
  );
};

export default RepositoryAnalysis; 