import React, { useEffect, useMemo } from 'react';
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

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Memoize scores to avoid dependency issues
  const scores = useMemo(() => 
    location.state?.scores || [],
    [location.state?.scores]
  );

  // Redirect to assessment if no scores available
  useEffect(() => {
    if (scores.length === 0) {
      navigate('../assessment', { replace: true });
    }
  }, [scores, navigate]);

  const getRecommendations = (score, category) => {
    if (score < 2) {
      return {
        level: 'Emerging',
        text: `Consider establishing basic ${category} practices to improve your development workflow.`,
        links: [
          {
            text: 'GitHub Flow Guide',
            url: 'https://docs.github.com/en/get-started/quickstart/github-flow'
          },
          {
            text: 'Setting up CI/CD',
            url: 'https://docs.github.com/en/actions/automating-builds-and-tests'
          }
        ]
      };
    } else if (score < 3) {
      return {
        level: 'Developing',
        text: `Good foundation in ${category}. Focus on automation and standardization.`,
        links: [
          {
            text: 'Branch Protection Rules',
            url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches'
          },
          {
            text: 'Advanced GitHub Actions',
            url: 'https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions'
          }
        ]
      };
    } else {
      return {
        level: 'Optimizing',
        text: `Strong ${category} practices. Consider advanced optimization and automation.`,
        links: [
          {
            text: 'GitHub Advanced Security',
            url: 'https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security'
          },
          {
            text: 'DevOps Best Practices',
            url: 'https://docs.github.com/en/enterprise-cloud@latest/admin/best-practices'
          }
        ]
      };
    }
  };

  const chartData = {
    labels: scores.map(s => s.category),
    datasets: [
      {
        label: 'Your Workflow Maturity',
        data: scores.map(s => s.score),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 4,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Score: ${context.raw.toFixed(1)} / 4.0`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const overallScore = scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length;

  return (
    <div className="results-container">
      <h2>Your DevOps Maturity Assessment</h2>
      
      <div className="overall-score">
        <h3>Overall Maturity Score</h3>
        <div className="score-value">{overallScore.toFixed(1)} / 4.0</div>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper">
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="recommendations">
        <h3>Recommendations by Category</h3>
        {scores.map((score) => {
          const recommendation = getRecommendations(score.score, score.category);
          return (
            <div key={score.category} className="recommendation-card">
              <div className="recommendation-header">
                <h4>{score.category}</h4>
                <span className={`maturity-level ${recommendation.level.toLowerCase()}`}>
                  {recommendation.level}
                </span>
              </div>
              <div className="recommendation-score">
                Score: {score.score.toFixed(1)} / {score.maxScore.toFixed(1)}
              </div>
              <p className="recommendation-text">{recommendation.text}</p>
              <div className="recommendation-links">
                <h5>Helpful Resources:</h5>
                <ul>
                  {recommendation.links.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.text} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="results-actions">
        <button 
          onClick={() => navigate('../assessment', { replace: true })}
          className="restart-button"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default Results;