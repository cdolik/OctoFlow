import React, { useState, useEffect } from 'react';
import { 
  getRepositoryCommits, 
  getRepositoryPullRequests, 
  getRepositoryContributors 
} from '../services/githubApi';
import { GitHubCommit, GitHubPullRequest, GitHubContributor } from '../types/github';

interface RepositoryTrendsProps {
  repoOwner: string;
  repoName: string;
}

const RepositoryTrends: React.FC<RepositoryTrendsProps> = ({ repoOwner, repoName }) => {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch data in parallel
        const [commitsData, prsData, contributorsData] = await Promise.all([
          getRepositoryCommits(repoOwner, repoName),
          getRepositoryPullRequests(repoOwner, repoName, 'all'),
          getRepositoryContributors(repoOwner, repoName)
        ]);
        
        setCommits(commitsData);
        setPullRequests(prsData);
        setContributors(contributorsData);
      } catch (err: unknown) {
        console.error('Error fetching repository trends:', err);
        setError(err instanceof Error ? err.message : 'Failed to load repository trends');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (repoOwner && repoName) {
      fetchTrendData();
    }
  }, [repoOwner, repoName]);

  // Calculate commit activity by week
  const getCommitActivityByWeek = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    // Filter commits from the last 30 days
    const recentCommits = commits.filter(commit => {
      const commitDate = new Date(commit.commit.author.date);
      return commitDate >= thirtyDaysAgo;
    });
    
    // Group by week
    const weeks: Record<string, number> = {};
    
    recentCommits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      const weekNumber = getWeekNumber(date);
      const weekKey = `Week ${weekNumber}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = 0;
      }
      
      weeks[weekKey]++;
    });
    
    return weeks;
  };
  
  // Helper to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Calculate PR merge ratio
  const getPullRequestStats = () => {
    const merged = pullRequests.filter(pr => pr.merged_at !== null).length;
    const closed = pullRequests.filter(pr => pr.state === 'closed' && pr.merged_at === null).length;
    const open = pullRequests.filter(pr => pr.state === 'open').length;
    
    return {
      merged,
      closed,
      open,
      total: pullRequests.length,
      mergeRatio: pullRequests.length > 0 ? (merged / pullRequests.length * 100).toFixed(1) : '0'
    };
  };

  // Calculate top contributors
  const getTopContributors = (limit = 5) => {
    return [...contributors]
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, limit);
  };

  if (isLoading) {
    return <div className="loading">Loading repository trends...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const commitActivity = getCommitActivityByWeek();
  const prStats = getPullRequestStats();
  const topContributors = getTopContributors();

  return (
    <div className="repository-trends">
      <h2>Repository Activity Trends</h2>
      
      <div className="trends-container">
        <div className="trend-section">
          <h3>Commit Activity (Last 30 Days)</h3>
          <div className="trend-chart">
            {Object.keys(commitActivity).length > 0 ? (
              <ul className="commit-chart">
                {Object.entries(commitActivity).map(([week, count]) => (
                  <li key={week}>
                    <div className="chart-label">{week}</div>
                    <div className="chart-bar" style={{ width: `${Math.min(count * 5, 100)}%` }}>
                      <span className="count">{count}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No commits in the last 30 days</p>
            )}
          </div>
        </div>
        
        <div className="trend-section">
          <h3>Pull Request Statistics</h3>
          <div className="pr-stats">
            <div className="stat-box">
              <div className="stat-value">{prStats.total}</div>
              <div className="stat-label">Total PRs</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{prStats.merged}</div>
              <div className="stat-label">Merged</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{prStats.open}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{prStats.mergeRatio}%</div>
              <div className="stat-label">Merge Ratio</div>
            </div>
          </div>
        </div>
        
        <div className="trend-section">
          <h3>Top Contributors</h3>
          {topContributors.length > 0 ? (
            <ul className="contributors-list">
              {topContributors.map(contributor => (
                <li key={contributor.id} className="contributor-item">
                  <img 
                    src={contributor.avatar_url} 
                    alt={contributor.login}
                    className="contributor-avatar" 
                  />
                  <div className="contributor-info">
                    <div className="contributor-name">
                      <a href={contributor.html_url} target="_blank" rel="noopener noreferrer">
                        {contributor.login}
                      </a>
                    </div>
                    <div className="contribution-count">
                      {contributor.contributions} {contributor.contributions === 1 ? 'contribution' : 'contributions'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No contributors found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryTrends; 