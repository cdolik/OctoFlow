import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const ActionTemplates: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          GitHub Action Templates
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Browse and implement pre-built GitHub Actions for your repositories.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <PlayArrowIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Action Templates Page
          </Typography>
          <Typography variant="body1" color="textSecondary">
            This page will provide a library of GitHub Actions templates that you can implement with a single click.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ActionTemplates; 