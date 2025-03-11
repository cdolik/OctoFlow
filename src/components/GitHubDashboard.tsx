import React, { useState, useEffect } from 'react';
import { useGitHub } from '../contexts/GitHubContext';
import { 
  getUserRepositories, 
  getOrganizationRepositories,
  getUserOrganizations
} from '../services/githubApi';
import RepositoryAnalysis from './RepositoryAnalysis';
import RepositoryTrends from './RepositoryTrends';
import { GitHubRepository, GitHubOrganization } from '../types/github';

// Define interface for selected repository
interface SelectedRepo {
  owner: string;
  name: string;
}

const GitHubDashboard: React.FC = () => {
  const { user, logout } = useGitHub();
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'org'>('personal');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<SelectedRepo | null>(null);
  const [showTrends, setShowTrends] = useState(false);

  // Fetch user's repositories and organizations on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user repositories
        const userRepos = await getUserRepositories();
        setRepositories(userRepos);
        
        // Fetch user organizations
        const orgs = await getUserOrganizations();
        setOrganizations(orgs);
        
        if (orgs.length > 0) {
          setSelectedOrg(orgs[0].login);
        }
      } catch (err) {
        console.error('Error fetching GitHub data:', err);
        setError('Failed to load GitHub data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch organization repositories when selected org changes
  useEffect(() => {
    if (activeTab === 'org' && selectedOrg) {
      const fetchOrgRepos = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const orgRepos = await getOrganizationRepositories(selectedOrg);
          setRepositories(orgRepos);
        } catch (err) {
          console.error(`Error fetching ${selectedOrg} repositories:`, err);
          setError(`Failed to load ${selectedOrg} repositories. Please try again later.`);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrgRepos();
    }
  }, [activeTab, selectedOrg]);

  // Switch to personal repositories
  const handlePersonalTabClick = async () => {
    if (activeTab !== 'personal') {
      setActiveTab('personal');
      setLoading(true);
      
      try {
        const userRepos = await getUserRepositories();
        setRepositories(userRepos);
      } catch (err) {
        console.error('Error fetching personal repositories:', err);
        setError('Failed to load personal repositories. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Switch to organization tab
  const handleOrgTabClick = () => {
    if (activeTab !== 'org') {
      setActiveTab('org');
    }
  };

  // Change selected organization
  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrg(e.target.value);
  };

  // Open repository analysis
  const handleAnalyzeRepo = (owner: string, name: string) => {
    setSelectedRepo({ owner, name });
  };

  // Close repository analysis
  const handleCloseAnalysis = () => {
    setSelectedRepo(null);
  };

  const handleViewTrends = (owner: string, name: string) => {
    setSelectedRepo({ owner, name });
    setShowTrends(true);
  };

  const handleCloseTrends = () => {
    setShowTrends(false);
  };

  if (loading && repositories.length === 0) {
    return <div className="loading">Loading GitHub data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  // If repository is selected for analysis and trends are not being shown, show the analysis component
  if (selectedRepo && !showTrends) {
    return (
      <RepositoryAnalysis 
        repoOwner={selectedRepo.owner}
        repoName={selectedRepo.name}
        onClose={handleCloseAnalysis}
      />
    );
  }

  return (
    <div className="github-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          {user?.avatar_url && (
            <img 
              src={user.avatar_url} 
              alt={`${user.login}'s avatar`} 
              className="user-avatar" 
            />
          )}
          <div className="user-details">
            <h2>{user?.name || user?.login}</h2>
            <p className="username">@{user?.login}</p>
            {user?.bio && <p className="user-bio">{user.bio}</p>}
          </div>
        </div>
        <button onClick={logout} className="logout-button">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={handlePersonalTabClick}
        >
          <i className="fas fa-user"></i> Personal Repositories
        </button>
        <button 
          className={`tab-button ${activeTab === 'org' ? 'active' : ''}`}
          onClick={handleOrgTabClick}
          disabled={organizations.length === 0}
        >
          <i className="fas fa-building"></i> Organization Repositories
        </button>
      </div>

      {activeTab === 'org' && organizations.length > 0 && (
        <div className="org-selector">
          <label htmlFor="org-select">Organization:</label>
          <select 
            id="org-select" 
            value={selectedOrg || ''} 
            onChange={handleOrgChange}
          >
            {organizations.map(org => (
              <option key={org.id} value={org.login}>
                {org.login}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading repositories...</div>
      ) : (
        <div className="repositories-list">
          <h3>
            {activeTab === 'personal' 
              ? 'Your Repositories' 
              : `${selectedOrg} Repositories`}
            <span className="repo-count">({repositories.length})</span>
          </h3>
          
          {repositories.length === 0 ? (
            <p className="no-repos">
              {activeTab === 'personal' 
                ? 'You don\'t have any repositories yet.' 
                : `${selectedOrg} doesn't have any repositories.`}
            </p>
          ) : (
            <ul className="repo-list">
              {repositories.map(repo => (
                <li key={repo.id} className="repo-item">
                  <div className="repo-header">
                    <h4 className="repo-name">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        {repo.name}
                      </a>
                    </h4>
                    <div className="repo-stats">
                      <span className="repo-stat">
                        <i className="fas fa-star"></i> {repo.stargazers_count}
                      </span>
                      <span className="repo-stat">
                        <i className="fas fa-code-branch"></i> {repo.forks_count}
                      </span>
                    </div>
                  </div>
                  
                  {repo.description && (
                    <p className="repo-description">{repo.description}</p>
                  )}
                  
                  <div className="repo-meta">
                    {repo.language && (
                      <span className="repo-language">
                        <span 
                          className="language-color" 
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        ></span>
                        {repo.language}
                      </span>
                    )}
                    <span className="repo-updated">
                      <i className="far fa-clock"></i> Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="repo-actions">
                    <button 
                      className="analyze-button"
                      onClick={() => handleAnalyzeRepo(repo.owner.login, repo.name)}
                    >
                      Analyze Repository
                    </button>
                    <button 
                      className="trends-button"
                      onClick={() => handleViewTrends(repo.owner.login, repo.name)}
                    >
                      View Trends
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showTrends && selectedRepo && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseTrends}>×</button>
            <RepositoryTrends 
              repoOwner={selectedRepo.owner} 
              repoName={selectedRepo.name} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get language color
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Ruby: '#701516',
    PHP: '#4F5D95',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    // Add more languages as needed
  };
  
  return colors[language] || '#858585';
};

export default GitHubDashboard; 