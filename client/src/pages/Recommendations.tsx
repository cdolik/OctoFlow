import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import RecommendIcon from '@mui/icons-material/Recommend';

const Recommendations: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recommendations
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          View and manage all recommendations across your repositories.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <RecommendIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Recommendations Page
          </Typography>
          <Typography variant="body1" color="textSecondary">
            This page will show consolidated recommendations across all repositories.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Recommendations; 