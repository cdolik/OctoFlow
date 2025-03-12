import React, { useEffect, useState } from 'react';
import { GitHubUser } from '../types/github';
import { getUserProfile, setGitHubToken } from '../services/githubApi';
import { 
  generateSecureRandomString, 
  generateCodeVerifier, 
  generateCodeChallenge,
  validateGitHubToken
} from '../utils/securityUtils';

interface GitHubOAuthProps {
  clientId: string;
  onLoginSuccess: (userData: GitHubUser) => void;
}

const GitHubOAuth: React.FC<GitHubOAuthProps> = ({ clientId, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to initiate OAuth flow with PKCE
  const handleLogin = async () => {
    try {
      // Save the current URL to return after authentication
      localStorage.setItem('github_oauth_redirect', window.location.href);
      
      // Generate PKCE code verifier and state parameter
      const codeVerifier = generateCodeVerifier();
      const state = generateSecureRandomString(32);
      
      // Store code verifier and state in localStorage for verification later
      localStorage.setItem('github_oauth_code_verifier', codeVerifier);
      localStorage.setItem('github_oauth_state', state);
      
      // Generate code challenge from verifier
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // GitHub OAuth URL
      const githubUrl = new URL('https://github.com/login/oauth/authorize');
      
      // Add required params
      githubUrl.searchParams.append('client_id', clientId);
      githubUrl.searchParams.append('scope', 'repo read:org');
      githubUrl.searchParams.append('redirect_uri', `${window.location.origin}${window.location.pathname}callback.html`);
      githubUrl.searchParams.append('state', state);
      githubUrl.searchParams.append('code_challenge', codeChallenge);
      githubUrl.searchParams.append('code_challenge_method', 'S256');
      
      // Redirect to GitHub
      window.location.href = githubUrl.toString();
    } catch (err) {
      console.error('Error initiating OAuth flow:', err);
      setError('Failed to initiate GitHub login. Please try again.');
    }
  };

  // Function to handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have a code in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const returnedState = urlParams.get('state');
      
      if (code) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Verify state parameter to prevent CSRF attacks
          const savedState = localStorage.getItem('github_oauth_state');
          if (!savedState || savedState !== returnedState) {
            throw new Error('Invalid state parameter. Possible CSRF attack.');
          }
          
          // Get code verifier from localStorage
          const codeVerifier = localStorage.getItem('github_oauth_code_verifier');
          if (!codeVerifier) {
            throw new Error('Code verifier not found. Please try logging in again.');
          }
          
          // Note: In a real implementation, you would exchange this code for a token using a serverless function
          // For this simple demo, we're simulating the exchange
          // This is just a placeholder to show the flow - DO NOT use in production
          
          // Simulate token exchange (in production, this would hit a serverless function)
          // Instead, we'll just get the token from localStorage for demo purposes
          // In a real app, you'd set up a serverless function to exchange the code for a token
          const token = localStorage.getItem('github_token');
          
          if (token && validateGitHubToken(token)) {
            setGitHubToken(token);
            const userData = await getUserProfile();
            onLoginSuccess(userData);
            
            // Clean up OAuth-related items from localStorage
            localStorage.removeItem('github_oauth_code_verifier');
            localStorage.removeItem('github_oauth_state');
            
            // Remove code from URL without reload
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            throw new Error('No valid token available for demo. Please use the manual token entry.');
          }
        } catch (err) {
          console.error('OAuth error:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed. Please try again or use a personal access token.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleCallback();
  }, [onLoginSuccess]);

  return (
    <div className="github-oauth">
      <button 
        className="github-button"
        onClick={handleLogin}
        disabled={isLoading}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" style={{ marginRight: '8px' }}>
          <path fill="currentColor" d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 0z"/>
        </svg>
        {isLoading ? 'Connecting...' : 'Login with GitHub'}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="oauth-note">
        <p>
          <strong>Note:</strong> This implementation uses PKCE (Proof Key for Code Exchange) for enhanced security.
          In a production application, you would need a serverless function to securely exchange the authorization code for a token.
        </p>
      </div>
    </div>
  );
};

export default GitHubOAuth; 