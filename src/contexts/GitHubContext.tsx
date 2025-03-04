import React, { createContext, useState, useContext, useEffect } from 'react';
import { getGitHubToken, clearGitHubToken, getUserProfile } from '../services/githubApi';
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
      const token = getGitHubToken();
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Session expired or invalid. Please log in again.');
        clearGitHubToken();
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
    clearGitHubToken();
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