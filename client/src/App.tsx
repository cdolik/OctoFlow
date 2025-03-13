import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import RepositoryDetails from './pages/RepositoryDetails';
import Layout from './components/Layout';
import './App.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2188ff',
    },
    secondary: {
      main: '#0366d6',
    },
    error: {
      main: '#d73a49',
    },
    warning: {
      main: '#ffd33d',
    },
    info: {
      main: '#79b8ff',
    },
    success: {
      main: '#28a745',
    },
    background: {
      default: '#f6f8fa',
    },
    // Add these to satisfy TypeScript
    neutral: {
      main: '#586069',
    },
    danger: {
      main: '#d73a49',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Extend the theme palette types to include our custom colors
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    danger: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
    danger: PaletteOptions['primary'];
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repository/:owner/:repo" element={<RepositoryDetails />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App; 