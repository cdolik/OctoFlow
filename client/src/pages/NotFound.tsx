import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper
        sx={{
          p: 4,
          mt: 8,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[3],
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            mb: 3,
            color: 'primary.main',
          }}
        />
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          404: Page Not Found
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 