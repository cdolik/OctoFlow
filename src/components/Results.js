import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const getRecommendations = (score) => {
  if (score < 2) {
    return {
      level: 'Foundational',
      description: 'Focus on establishing basic practices.',
      links: [
        { text: 'GitHub Flow Guide', url: 'https://docs.github.com/en/get-started/quickstart/github-flow' },
        { text: 'CI/CD Fundamentals', url: 'https://docs.github.com/en/actions/automating-builds-and-tests' }
      ]
    };
  } else if (score < 3) {
    return {
      level: 'Intermediate',
      description: 'Good foundation. Time to enhance automation and standardization.',
      links: [
        { text: 'Branch Protection Rules', url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches' },
        { text: 'Advanced CI/CD', url: 'https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions' }
      ]
    };
  } else {
    return {
      level: 'Advanced',
      description: 'Excellent practices. Consider fine-tuning and optimization.',
      links: [
        { text: 'GitHub Advanced Security', url: 'https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security' },
        { text: 'DevOps Best Practices', url: 'https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration' }
      ]
    };
  }
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores } = location.state || {};

  if (!scores) {
    navigate('/assessment');
    return null;
  }

  const categories = Object.values(scores);
  const averageScore = categories.reduce((acc, cat) => acc + cat.average, 0) / categories.length;
  const recommendations = getRecommendations(averageScore);

  const chartData = {
    labels: categories.map(cat => cat.title),
    datasets: [
      {
        label: 'Your Score',
        data: categories.map(cat => cat.average),
        backgroundColor: 'rgba(46, 164, 79, 0.2)',
        borderColor: 'rgba(46, 164, 79, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(46, 164, 79, 1)',
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw.toFixed(1)}/4`
        }
      }
    }
  };

  return (
    <div className="results-container">
      <h2>Your GitHub Workflow Assessment Results</h2>
      <div className="results-score">
        <h3>Overall Maturity Level: {recommendations.level}</h3>
        <p className="score-description">{recommendations.description}</p>
      </div>

      <div className="chart-container">
        <Radar data={chartData} options={chartOptions} />
      </div>

      <div className="category-details">
        {categories.map(category => (
          <div key={category.title} className="category-score">
            <h4>{category.title}</h4>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${(category.average / 4) * 100}%` }}
              />
              <span className="score-text">{category.average.toFixed(1)}/4</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations">
        <h3>Recommended Resources</h3>
        <div className="resource-links">
          {recommendations.links.map((link, index) => (
            <a 
              key={index} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="resource-link"
            >
              {link.text} →
            </a>
          ))}
        </div>
      </div>

      <button 
        onClick={() => navigate('/assessment')} 
        className="restart-button"
      >
        Start New Assessment
      </button>
    </div>
  );
};

export default Results;