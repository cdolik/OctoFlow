import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import HealthScoreDonut from '../components/charts/HealthScoreDonut';
import HealthRadarChart from '../components/charts/HealthRadarChart';
import RecommendationsList from '../components/repository/RecommendationsList';
import SecurityInsights from '../components/repository/SecurityInsights';
import HistoricalTrends from '../components/repository/HistoricalTrends';
import { repositoryApi } from '../services/api';

const RepositoryDetails: React.FC = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await repositoryApi.assessRepository(owner!, repo!);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (owner && repo) {
      fetchData();
    }
  }, [owner, repo]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <HealthScoreDonut score={data.healthScore} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <HealthRadarChart data={data.metrics} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <RecommendationsList recommendations={data.recommendations} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <SecurityInsights />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <HistoricalTrends />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RepositoryDetails; 