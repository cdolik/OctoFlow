import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const HistoricalTrends: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Historical Trends
      </Typography>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Historical data tracking will be available in a future update.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This feature will allow you to track repository health metrics over time and visualize trends.
        </Typography>
      </Box>
    </Paper>
  );
};

export default HistoricalTrends; 