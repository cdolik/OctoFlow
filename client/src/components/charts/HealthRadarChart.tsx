import React from 'react';
import { Box, Grid, LinearProgress, Typography, useTheme } from '@mui/material';

interface HealthRadarChartProps {
  data: {
    security: number;
    reliability: number;
    maintainability: number;
    collaboration: number;
    velocity: number;
  };
}

const HealthRadarChart: React.FC<HealthRadarChartProps> = ({ data }) => {
  const theme = useTheme();

  const metrics = [
    { key: 'security', label: 'Security', value: data.security },
    { key: 'reliability', label: 'Reliability', value: data.reliability },
    { key: 'maintainability', label: 'Maintainability', value: data.maintainability },
    { key: 'collaboration', label: 'Collaboration', value: data.collaboration },
    { key: 'velocity', label: 'Velocity', value: data.velocity },
  ];

  const getProgressColor = (value: number) => {
    if (value >= 90) return theme.palette.success.main;
    if (value >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} key={metric.key}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{metric.label}</Typography>
              <Typography variant="body2" fontWeight="bold">
                {metric.value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metric.value}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: getProgressColor(metric.value),
                },
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HealthRadarChart; 