import React, { createContext, useState, useContext, useEffect } from 'react';
import { setGitHubToken, hasGitHubToken, getUserProfile } from '../services/githubApi';
import { GitHubUser } from '../types/github';

interface GitHubContextType {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  loading: boolean;
  error: string | null;
  login: (userData: GitHubUser) => void;
  logout: () => void;
}

const defaultContext: GitHubContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: () => { /* This is intentionally empty as it will be implemented in the provider */ },
  logout: () => { /* This is intentionally empty as it will be implemented in the provider */ },
};

const GitHubContext = createContext<GitHubContextType>(defaultContext);

export const useGitHub = () => useContext(GitHubContext);

export const GitHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = hasGitHubToken();
        if (token) {
          const userProfile = await getUserProfile();
          if (userProfile) {
            setUser(userProfile);
            setIsAuthenticated(true);
          } else {
            setGitHubToken(''); // Clear invalid token
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Authentication error');
        setGitHubToken('');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: GitHubUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
  };

  const logout = () => {
    setGitHubToken('');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
};

export default GitHubContext; 