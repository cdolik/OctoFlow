import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Divider,
  Tooltip,
  Grid,
  LinearProgress,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldIcon from '@mui/icons-material/Shield';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';

interface Score {
  security: number;
  reliability: number;
  maintainability: number;
  collaboration: number;
  velocity: number;
}

interface HealthScoreCardProps {
  repositoryName: string;
  healthScore: number;
  lastAnalyzed: string;
  scores: Score;
}

const ScoreCircle = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 50) return 'warning';
  return 'danger';
};

const CategoryScore: React.FC<{ name: string; score: number; icon: React.ReactNode }> = ({
  name,
  score,
  icon,
}) => {
  const color = getScoreColor(score);
  
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ mr: 1, color: `${color}.main` }}>{icon}</Box>
        <Typography variant="caption" color="textSecondary">
          {name}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto', fontWeight: 'bold' }}>
          {score}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        color={color as 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info'}
        sx={{ height: 5, borderRadius: 5 }}
      />
    </Box>
  );
};

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  repositoryName,
  healthScore,
  lastAnalyzed,
  scores,
}) => {
  const [owner, repo] = repositoryName.split('/');
  const scoreColor = getScoreColor(healthScore);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <GitHubIcon sx={{ mr: 1, fontSize: '1rem', color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {repositoryName}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary">
              Last analyzed: {formatDate(lastAnalyzed)}
            </Typography>
          </Box>
          <Chip
            label={`${healthScore}%`}
            size="small"
            color={scoreColor as 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info'}
            sx={{ fontWeight: 'bold', ml: 1 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <ScoreCircle>
                <CircularProgress
                  variant="determinate"
                  value={healthScore}
                  size={80}
                  thickness={6}
                  color={scoreColor as 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info'}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {healthScore}
                  </Typography>
                </Box>
              </ScoreCircle>
            </Grid>
            <Grid item xs>
              <Typography variant="body2" fontWeight="medium">
                Overall Health Score
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Based on 5 key metrics
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 1 }}>
          <CategoryScore
            name="Security"
            score={scores.security}
            icon={<ShieldIcon fontSize="small" />}
          />
          <CategoryScore
            name="Reliability"
            score={scores.reliability}
            icon={<VerifiedIcon fontSize="small" />}
          />
          <CategoryScore
            name="Maintainability"
            score={scores.maintainability}
            icon={<BuildIcon fontSize="small" />}
          />
          <CategoryScore
            name="Collaboration"
            score={scores.collaboration}
            icon={<GroupIcon fontSize="small" />}
          />
          <CategoryScore
            name="Velocity"
            score={scores.velocity}
            icon={<SpeedIcon fontSize="small" />}
          />
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/repository/${owner}/${repo}`}
          variant="outlined"
          color="primary"
          fullWidth
          endIcon={<ArrowForwardIcon />}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default HealthScoreCard; 