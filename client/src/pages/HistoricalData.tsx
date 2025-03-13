import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const HistoricalData: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historical Data
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Track changes in repository health over time.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <HistoryIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Historical Data Page
          </Typography>
          <Typography variant="body1" color="textSecondary">
            This page will display trends and changes in repository health metrics over time.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HistoricalData; 