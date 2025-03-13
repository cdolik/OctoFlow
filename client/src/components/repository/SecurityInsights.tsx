import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Paper,
} from '@mui/material';

// Mock data for the security insights
const securityInsightsData = {
  score: 92,
  metrics: [
    { name: 'Dependency Scanning', score: 85, description: 'Checks for vulnerabilities in dependencies' },
    { name: 'SAST', score: 90, description: 'Static Application Security Testing' },
    { name: 'Secret Detection', score: 70, description: 'Detects secrets and credentials in code' },
    { name: 'Security Headers', score: 95, description: 'Implementation of security headers' },
  ],
};

const SecurityInsights: React.FC = () => {
  const { metrics } = securityInsightsData;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success.main';
    if (score >= 70) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Overview
      </Typography>
      
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} key={metric.name}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {metric.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {metric.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={metric.score}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: getScoreColor(metric.score),
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                      metric.score
                    )}%`}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Security Recommendations
        </Typography>
        <Typography variant="body2" paragraph>
          1. Enable dependency scanning in your CI/CD pipeline to detect vulnerable dependencies.
        </Typography>
        <Typography variant="body2" paragraph>
          2. Add SAST (Static Application Security Testing) to identify security issues in your code.
        </Typography>
        <Typography variant="body2" paragraph>
          3. Implement secret detection to prevent exposing credentials in your codebase.
        </Typography>
        <Typography variant="body2">
          4. Configure security headers to protect against common web vulnerabilities.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SecurityInsights; 