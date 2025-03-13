import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface HealthScoreDonutProps {
  score: number;
  size?: number;
}

const HealthScoreDonut: React.FC<HealthScoreDonutProps> = ({ score, size = 200 }) => {
  const theme = useTheme();
  
  // Determine color based on score
  const getScoreColor = (value: number) => {
    if (value >= 90) return theme.palette.success.main;
    if (value >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const scoreColor = getScoreColor(score);
  
  // For now, we'll create a simple representation without Chart.js
  // This avoids the TypeScript errors while still showing something useful
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          border: `${size / 20}px solid ${theme.palette.grey[200]}`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          border: `${size / 20}px solid ${scoreColor}`,
          borderTop: `${size / 20}px solid transparent`,
          borderRight: `${size / 20}px solid transparent`,
          borderBottom: `${size / 20}px solid transparent`,
          transform: `rotate(${score * 3.6}deg)`,
          transition: 'transform 1s ease-in-out',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Typography variant="h3" component="div" fontWeight="bold" color={scoreColor}>
          {score}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Health Score
        </Typography>
      </Box>
    </Box>
  );
};

export default HealthScoreDonut; 