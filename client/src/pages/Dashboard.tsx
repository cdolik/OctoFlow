import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
  Code as CodeIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

// Mock data for repositories
const mockRepositories = [
  {
    id: 1,
    name: 'react',
    owner: 'facebook',
    healthScore: 92,
    securityScore: 95,
    reliabilityScore: 90,
    maintainabilityScore: 88,
    collaborationScore: 94,
    velocityScore: 93,
    lastUpdated: '2023-05-10T14:48:00Z',
  },
  {
    id: 2,
    name: 'typescript',
    owner: 'microsoft',
    healthScore: 89,
    securityScore: 92,
    reliabilityScore: 88,
    maintainabilityScore: 90,
    collaborationScore: 85,
    velocityScore: 90,
    lastUpdated: '2023-05-09T10:30:00Z',
  },
  {
    id: 3,
    name: 'vscode',
    owner: 'microsoft',
    healthScore: 94,
    securityScore: 96,
    reliabilityScore: 93,
    maintainabilityScore: 92,
    collaborationScore: 95,
    velocityScore: 94,
    lastUpdated: '2023-05-11T09:15:00Z',
  },
  {
    id: 4,
    name: 'node',
    owner: 'nodejs',
    healthScore: 87,
    securityScore: 85,
    reliabilityScore: 89,
    maintainabilityScore: 86,
    collaborationScore: 88,
    velocityScore: 87,
    lastUpdated: '2023-05-08T16:20:00Z',
  },
];

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  const filteredRepositories = mockRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#ffd33d';
    return '#d73a49';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Repository Health Dashboard
      </Typography>

      <Paper
        component="form"
        sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center' }}
        onSubmit={handleSearch}
      >
        <TextField
          fullWidth
          placeholder="Search repositories (e.g., facebook/react)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ ml: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Recent Repositories
      </Typography>

      <Grid container spacing={3}>
        {filteredRepositories.map((repo) => (
          <Grid item xs={12} sm={6} md={4} key={repo.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    {repo.owner}/{repo.name}
                  </Typography>
                  <Chip
                    label={`${repo.healthScore}%`}
                    style={{
                      backgroundColor: getScoreColor(repo.healthScore),
                      color: repo.healthScore >= 70 ? '#000' : '#fff',
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <SecurityIcon fontSize="small" sx={{ mr: 1, color: getScoreColor(repo.securityScore) }} />
                      <Typography variant="body2">Security: {repo.securityScore}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <BuildIcon fontSize="small" sx={{ mr: 1, color: getScoreColor(repo.reliabilityScore) }} />
                      <Typography variant="body2">Reliability: {repo.reliabilityScore}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <CodeIcon fontSize="small" sx={{ mr: 1, color: getScoreColor(repo.maintainabilityScore) }} />
                      <Typography variant="body2">Maintainability: {repo.maintainabilityScore}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <PeopleIcon fontSize="small" sx={{ mr: 1, color: getScoreColor(repo.collaborationScore) }} />
                      <Typography variant="body2">Collaboration: {repo.collaborationScore}%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <SpeedIcon fontSize="small" sx={{ mr: 1, color: getScoreColor(repo.velocityScore) }} />
                      <Typography variant="body2">Velocity: {repo.velocityScore}%</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  Last updated: {new Date(repo.lastUpdated).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={Link}
                  to={`/repository/${repo.owner}/${repo.name}`}
                >
                  View Details
                </Button>
                <Button size="small">Run Assessment</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 