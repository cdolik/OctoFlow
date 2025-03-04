import React, { useState } from 'react';
import { setGitHubToken, getUserProfile } from '../services/githubApi';
import { GitHubUser } from '../types/github';

interface GitHubLoginProps {
  onLoginSuccess: (userData: GitHubUser) => void;
}

const GitHubLogin: React.FC<GitHubLoginProps> = ({ onLoginSuccess }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter a GitHub token');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Set the token in the service
      setGitHubToken(token);
      
      // Test the token by fetching user profile
      const userData = await getUserProfile();
      
      // If successful, call the success callback
      onLoginSuccess(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid token or API error. Please check your token and try again.');
      setToken('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="github-login">
      <h2>Connect to GitHub</h2>
      <p>
        Enter your GitHub personal access token to connect your repositories.
        This token will only be used locally and won&apos;t be stored on any server.
      </p>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="github-token">GitHub Personal Access Token:</label>
          <input
            type="password"
            id="github-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            disabled={isLoading}
          />
          <small>
            Need a token? <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">
              Create one
            </a> with <code>repo</code> and <code>read:org</code> scopes.
          </small>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="primary-button"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect to GitHub'}
        </button>
      </form>
    </div>
  );
};

export default GitHubLogin; 