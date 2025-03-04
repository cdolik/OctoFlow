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