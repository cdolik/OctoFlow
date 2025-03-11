/**
 * Service for fetching PR insights data
 */

// Get API base URL from environment or use default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Types for our PR insights data
export interface PRRecommendation {
  title: string;
  score: number;
  recommendations: string[];
}

export interface PRStats {
  totalAnalyzed: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    needsImprovement: number;
    poor: number;
  };
  recentPRs: PRRecommendation[];
}

export interface PRInsights {
  lastUpdated: string;
  prStats: PRStats;
}

// For development, we'll use sample data if the real data can't be fetched
const sampleInsights: PRInsights = {
  lastUpdated: new Date().toISOString(),
  prStats: {
    totalAnalyzed: 6,
    averageScore: 70.8,
    scoreDistribution: {
      excellent: 0,
      good: 4,
      needsImprovement: 2,
      poor: 0
    },
    recentPRs: [
      {
        title: "Sample PR for Testing",
        score: 86,
        recommendations: [
          "Consider using conventional commit prefixes in your title (e.g., \"feat:\", \"fix:\").",
          "Consider explaining WHY this change is needed in the description.",
          "This PR has no reviews. Consider requesting a review."
        ]
      },
      {
        title: "feat: Sample feature PR",
        score: 97,
        recommendations: [
          "Consider explaining how you tested these changes."
        ]
      }
    ]
  }
};

/**
 * Fetches PR insights data
 * @returns Promise with PR insights data
 */
export const fetchPRInsights = async (): Promise<PRInsights> => {
  try {
    // First try the API endpoint
    const response = await fetch(`${API_BASE_URL}/insights/summary`);
    
    if (!response.ok) {
      console.warn('Failed to fetch PR insights from API, trying static file...');
      
      // If API fails, try the static file
      const fileResponse = await fetch('/data/summary.json');
      
      if (!fileResponse.ok) {
        console.warn('Failed to fetch PR insights from static file, using sample data');
        return sampleInsights;
      }
      
      return await fileResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching PR insights:', error);
    console.warn('Using sample data instead');
    return sampleInsights;
  }
};

/**
 * Fetches detailed PR insights for a specific date
 * @param date - The date for which to fetch insights (YYYY-MM-DD)
 * @returns Promise with PR insights data for the specified date
 */
export const fetchDetailedInsights = async (date: string): Promise<any[]> => {
  try {
    // First try the API endpoint
    const response = await fetch(`${API_BASE_URL}/insights/${date}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch detailed insights from API for ${date}, trying static file...`);
      
      // If API fails, try the static file
      const fileResponse = await fetch(`/data/insights/${date}/pr-insights.json`);
      
      if (!fileResponse.ok) {
        console.warn(`Failed to fetch detailed insights from static file for ${date}`);
        return [];
      }
      
      return await fileResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching detailed insights for ${date}:`, error);
    return [];
  }
};

/**
 * Fetches raw PR data for a specific date
 * @param date - The date for which to fetch data (YYYY-MM-DD)
 * @returns Promise with raw PR data for the specified date
 */
export const fetchRawPRData = async (date: string): Promise<any[]> => {
  try {
    // First try the API endpoint
    const response = await fetch(`${API_BASE_URL}/raw/${date}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch raw PR data from API for ${date}, trying static file...`);
      
      // If API fails, try the static file
      const fileResponse = await fetch(`/data/raw/${date}/pr-data.json`);
      
      if (!fileResponse.ok) {
        console.warn(`Failed to fetch raw PR data from static file for ${date}`);
        return [];
      }
      
      return await fileResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching raw PR data for ${date}:`, error);
    return [];
  }
};

/**
 * Gets the list of available dates with insights data
 * @returns Promise with array of dates (YYYY-MM-DD)
 */
export const getAvailableInsightDates = async (): Promise<string[]> => {
  try {
    // Try the API endpoint
    const response = await fetch(`${API_BASE_URL}/insights/dates`);
    
    if (!response.ok) {
      console.warn('Failed to fetch available insight dates');
      // Return today as a fallback
      const today = new Date().toISOString().split('T')[0];
      return [today];
    }
    
    const dates = await response.json();
    
    if (!Array.isArray(dates) || dates.length === 0) {
      // If no dates or invalid format, return today
      const today = new Date().toISOString().split('T')[0];
      return [today];
    }
    
    return dates;
  } catch (error) {
    console.error('Error fetching available insight dates:', error);
    // Return today as a fallback
    const today = new Date().toISOString().split('T')[0];
    return [today];
  }
}; 