import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
}));

// Serve static files from the React app build directory in production
app.use(express.static(path.join(__dirname, 'build')));

// Serve data files
app.use('/data', express.static(path.join(__dirname, 'data')));

// API endpoint to list available insight dates
app.get('/api/insights/dates', (req, res) => {
  try {
    const insightsDir = path.join(__dirname, 'data', 'insights');
    
    if (!fs.existsSync(insightsDir)) {
      return res.json([]);
    }
    
    const dates = fs.readdirSync(insightsDir)
      .filter(dir => fs.statSync(path.join(insightsDir, dir)).isDirectory());
    
    res.json(dates);
  } catch (error) {
    console.error('Error listing insight dates:', error);
    res.status(500).json({ error: 'Failed to list insight dates' });
  }
});

// API endpoint to get PR insights summary
app.get('/api/insights/summary', (req, res) => {
  try {
    const summaryFile = path.join(__dirname, 'data', 'summary.json');
    
    if (!fs.existsSync(summaryFile)) {
      return res.status(404).json({ error: 'Summary file not found' });
    }
    
    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    res.json(summary);
  } catch (error) {
    console.error('Error reading summary:', error);
    res.status(500).json({ error: 'Failed to read summary data' });
  }
});

// API endpoint to get detailed PR insights for a specific date
app.get('/api/insights/:date', (req, res) => {
  try {
    const date = req.params.date;
    const insightsFile = path.join(__dirname, 'data', 'insights', date, 'pr-insights.json');
    
    if (!fs.existsSync(insightsFile)) {
      return res.status(404).json({ error: 'Insights file not found for the specified date' });
    }
    
    const insights = JSON.parse(fs.readFileSync(insightsFile, 'utf8'));
    res.json(insights);
  } catch (error) {
    console.error(`Error reading insights for date ${req.params.date}:`, error);
    res.status(500).json({ error: 'Failed to read insights data' });
  }
});

// API endpoint to get raw PR data for a specific date
app.get('/api/raw/:date', (req, res) => {
  try {
    const date = req.params.date;
    const rawFile = path.join(__dirname, 'data', 'raw', date, 'pr-data.json');
    
    if (!fs.existsSync(rawFile)) {
      return res.status(404).json({ error: 'Raw data file not found for the specified date' });
    }
    
    const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
    res.json(rawData);
  } catch (error) {
    console.error(`Error reading raw data for date ${req.params.date}:`, error);
    res.status(500).json({ error: 'Failed to read raw data' });
  }
});

// Handle any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`- API URL: http://localhost:${PORT}/api`);
  console.log(`- Data files: http://localhost:${PORT}/data`);
}); 