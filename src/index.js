import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const container = document.getElementById('root');
const root = createRoot(container!);

// Enable strict mode for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Analytics tracking
reportWebVitals(metric => {
  // Only send performance metrics in production
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
  }
});
