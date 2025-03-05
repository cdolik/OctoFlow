const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// GitHub API base URL
const GITHUB_API_URL = 'https://api.github.com';

// Middleware to check for GitHub token
const requireToken = (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'GitHub token is required' });
  }
  
  req.githubToken = token;
  next();
};

// Helper function to get user from session/token
const getUserFromSession = async (req) => {
  // This is a simplified version - in a real app, you would retrieve user data
  // from a database, session, or other storage mechanism
  
  // If there's a GitHub token, fetch user data from GitHub API
  if (req.githubToken) {
    try {
      const response = await axios.get(`${GITHUB_API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${req.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OctoFlow-App'
        }
      });
      
      // For demo purposes, we'll set hardcoded eligibility values
      // In a real app, these would be retrieved from your database
      return {
        id: response.data.id.toString(),
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        isGitHubEnterpriseCustomer: false, // Demo value
        seriesFundingStage: 'Series A', // Demo value
        isGitHubForStartupsPartner: true, // Demo value
        employeeCount: 50, // Demo value
        companyAgeYears: 2 // Demo value
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
  
  // Return demo user if no token
  return {
    id: 'demo-user',
    login: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    isGitHubEnterpriseCustomer: false,
    seriesFundingStage: 'Series A',
    isGitHubForStartupsPartner: true,
    employeeCount: 50,
    companyAgeYears: 2
  };
};

// GitHub for Startups eligibility check endpoint
app.get('/api/check-eligibility', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    
    // Check eligibility criteria
    const isEligible = (
      user.isGitHubEnterpriseCustomer === false &&
      user.seriesFundingStage !== 'Series C+' &&
      user.isGitHubForStartupsPartner === true
    );
    
    // Get ineligibility reasons if not eligible
    const ineligibilityReasons = [];
    
    if (user.isGitHubEnterpriseCustomer) {
      ineligibilityReasons.push("Already a GitHub Enterprise/Advanced Security customer");
    }
    
    if (user.seriesFundingStage === 'Series C+') {
      ineligibilityReasons.push("Series C or later companies are not eligible");
    }
    
    if (!user.isGitHubForStartupsPartner) {
      ineligibilityReasons.push("Not affiliated with a GitHub for Startups partner");
    }
    
    res.json({ isEligible, ineligibilityReasons });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ error: 'Failed to check eligibility status' });
  }
});

// GitHub API proxy - GET requests
app.get('/github/*', requireToken, async (req, res) => {
  try {
    const endpoint = req.params[0];
    const queryParams = new URLSearchParams(req.query).toString();
    const url = `${GITHUB_API_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${req.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OctoFlow-App'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.message || 'GitHub API error'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GitHub API proxy - POST requests
app.post('/github/*', requireToken, async (req, res) => {
  try {
    const endpoint = req.params[0];
    const url = `${GITHUB_API_URL}/${endpoint}`;
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Authorization': `Bearer ${req.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OctoFlow-App'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('GitHub API Error:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.message || 'GitHub API error'
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running correctly!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GitHub API proxy available at http://localhost:${PORT}/github/`);
}); 