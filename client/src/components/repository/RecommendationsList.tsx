import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  Button,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Build as BuildIcon,
  Code as CodeIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Recommendation {
  id: number;
  category: string;
  severity: string;
  title: string;
  description: string;
  impact?: string;
  effort?: string;
  implementation?: string;
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  // Function to get the icon for each category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <SecurityIcon color="error" />;
      case 'reliability':
        return <BuildIcon color="warning" />;
      case 'maintainability':
        return <CodeIcon color="info" />;
      case 'collaboration':
        return <PeopleIcon color="primary" />;
      case 'velocity':
        return <SpeedIcon color="success" />;
      default:
        return <WarningIcon />;
    }
  };

  // Function to get the severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <WarningIcon />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recommendations ({recommendations.length})</Typography>
      </Box>
      
      <List sx={{ width: '100%' }}>
        {recommendations.map((recommendation) => (
          <ListItem
            key={recommendation.id}
            alignItems="flex-start"
            sx={{
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon>{getCategoryIcon(recommendation.category)}</ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{recommendation.title}</Typography>
                  <Chip
                    label={recommendation.category}
                    size="small"
                    color={
                      recommendation.category === 'security'
                        ? 'error'
                        : recommendation.category === 'reliability'
                        ? 'warning'
                        : recommendation.category === 'maintainability'
                        ? 'info'
                        : recommendation.category === 'collaboration'
                        ? 'primary'
                        : 'success'
                    }
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.primary" component="span">
                    {recommendation.description}
                  </Typography>
                  
                  {recommendation.impact && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Impact:</strong> {recommendation.impact}
                    </Typography>
                  )}
                  
                  <Box mt={1} display="flex" gap={1}>
                    {recommendation.severity && (
                      <Chip
                        icon={getSeverityIcon(recommendation.severity)}
                        label={`Severity: ${recommendation.severity}`}
                        size="small"
                      />
                    )}
                    {recommendation.effort && (
                      <Chip label={`Effort: ${recommendation.effort}`} size="small" />
                    )}
                  </Box>
                </>
              }
            />
            <Button variant="contained" size="small" sx={{ mt: 2, ml: 2 }}>
              Implement
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default RecommendationsList; 