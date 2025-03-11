import React, { useState } from 'react';
import { setGitHubToken, getUserProfile } from '../services/githubApi';
import { GitHubUser } from '../types/github';
import GitHubOAuth from './GitHubOAuth';

interface GitHubLoginProps {
  onLoginSuccess: (userData: GitHubUser) => void;
}

const GitHubLogin: React.FC<GitHubLoginProps> = ({ onLoginSuccess }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // GitHub OAuth client ID - replace with your own when ready
  // For demo purposes only - in production use environment variables
  const GITHUB_CLIENT_ID = 'your_client_id_here';

  const handleManualLogin = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid token or API error. Please check your token and try again.');
      setToken('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="github-login">
      <h2>Connect to GitHub</h2>
      
      {/* OAuth Login Option */}
      <div className="login-option oauth-option">
        <h3>Option 1: Quick Connect</h3>
        <GitHubOAuth 
          clientId={GITHUB_CLIENT_ID}
          onLoginSuccess={onLoginSuccess}
        />
        <p className="note">
          Note: This is a simplified demo. In a real application, 
          you would need a server to securely handle the OAuth flow.
        </p>
      </div>
      
      <div className="login-divider">
        <span>OR</span>
      </div>
      
      {/* Manual Token Option */}
      <div className="login-option manual-option">
        <h3>Option 2: Enter Token Manually</h3>
        <p>
          Enter your GitHub personal access token to connect your repositories.
          This token will only be stored locally in your browser.
        </p>
        
        <form onSubmit={handleManualLogin}>
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
            {isLoading ? 'Connecting...' : 'Connect with Token'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GitHubLogin; 