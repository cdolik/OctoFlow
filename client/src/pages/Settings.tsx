import React from 'react';
import { Box, Typography, Container, Paper, Divider, Switch, FormControlLabel, TextField, Button, Grid } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';

const Settings: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Configure your OctoFlow preferences and integrations.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5">General Settings</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable dark mode"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show repository health score on dashboard"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable email notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch />}
              label="Enable browser notifications"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5">GitHub Integration</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GitHub API Token"
              type="password"
              placeholder="Enter your GitHub API token"
              helperText="Required for accessing private repositories"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GitHub Organization"
              placeholder="Enter your GitHub organization name"
              helperText="Optional: Limit analysis to a specific organization"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Automatically analyze new repositories"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          size="large"
        >
          Save Settings
        </Button>
      </Box>
    </Container>
  );
};

export default Settings; 