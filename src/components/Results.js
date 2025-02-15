import React, { useMemo } from 'react';
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
import { STAGE_CONFIG } from '../data/stages';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const GitHubOffer = ({ type, title, description, ctaText, ctaLink }) => (
  <div className="github-offer-card">
    <div className="offer-badge">{type}</div>
    <h4>{title}</h4>
    <p>{description}</p>
    <a 
      href={ctaLink}
      className="github-cta"
      target="_blank"
      rel="noopener noreferrer"
    >
      {ctaText}
    </a>
  </div>
);

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const scores = useMemo(() => 
    location.state?.scores || [],
    [location.state?.scores]
  );
  
  const stage = useMemo(() => 
    location.state?.stage || sessionStorage.getItem('selectedStage'),
    [location.state?.stage]
  );

  React.useEffect(() => {
    if (scores.length === 0 || !stage) {
      navigate('/');
    }
  }, [scores.length, stage, navigate]);

  const githubOffers = [
    {
      condition: (scores) => {
        const securityScore = scores.find(s => s.category === 'GitHub Ecosystem')?.score || 0;
        return securityScore < 2;
      },
      content: () => (
        <GitHubOffer
          type="Security Offer"
          title="Get Started with GitHub Advanced Security"
          description="Enable automated security features including Dependabot alerts, secret scanning, and code analysis."
          ctaText="Enable Security Features →"
          ctaLink="https://github.com/features/security"
        />
      )
    },
    {
      condition: (scores) => {
        const automationScore = scores.find(s => s.category === 'CI/CD & Automation')?.score || 0;
        return automationScore < 3;
      },
      content: () => (
        <GitHubOffer
          type="Automation Offer"
          title="Accelerate with GitHub Actions"
          description="Automate your workflow with our library of 12,000+ pre-built actions."
          ctaText="Explore Actions Marketplace →"
          ctaLink="https://github.com/marketplace?type=actions"
        />
      )
    },
    {
      condition: (scores) => stage === 'pre-seed',
      content: () => (
        <GitHubOffer
          type="Startup Offer"
          title="Join GitHub for Startups"
          description="Get up to $120k in GitHub Enterprise credits and dedicated startup support."
          ctaText="Apply Now →"
          ctaLink="https://github.com/enterprise/startups"
        />
      )
    }
  ];

  const chartData = {
    labels: scores.map(s => s.category),
    datasets: [
      {
        label: 'Your Workflow Maturity',
        data: scores.map(s => s.score),
        backgroundColor: 'rgba(45, 164, 78, 0.2)',
        borderColor: '#2DA44E',
        borderWidth: 2,
        pointBackgroundColor: scores.map(s => 
          s.focus ? '#2DA44E' : 'rgba(45, 164, 78, 0.5)'
        ),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#2DA44E'
      }
    ]
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        suggestedMin: 0,
        suggestedMax: 4,
        ticks: {
          stepSize: 1,
          color: '#666',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const score = context.raw.toFixed(1);
            const isFocus = scores[context.dataIndex].focus;
            return `Score: ${score}/4.0 ${isFocus ? '(Focus Area)' : ''}`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const overallScore = scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length;
  const focusAreaScore = scores
    .filter(s => s.focus)
    .reduce((acc, curr) => acc + curr.score, 0) / scores.filter(s => s.focus).length;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Your GitHub Workflow Assessment</h2>
        <div className="stage-badge">
          {STAGE_CONFIG[stage]?.label}
        </div>
      </div>
      
      <div className="score-overview">
        <div className="score-card overall">
          <h3>Overall Maturity</h3>
          <div className="score-value">{overallScore.toFixed(1)} / 4.0</div>
        </div>
        <div className="score-card focus">
          <h3>Focus Areas</h3>
          <div className="score-value">{focusAreaScore.toFixed(1)} / 4.0</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-wrapper">
          <Radar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="github-offers">
        <h3>Recommended GitHub Solutions</h3>
        <div className="offers-grid">
          {githubOffers
            .filter(offer => offer.condition(scores))
            .map((offer, index) => (
              <React.Fragment key={`offer-${index}`}>
                {offer.content()}
              </React.Fragment>
            ))}
        </div>
      </div>

      <div className="recommendations">
        <h3>Detailed Recommendations</h3>
        {scores.map((score) => {
          const category = categories.find(c => c.title === score.category);
          const recommendations = category?.questions
            .filter(q => {
              const questionScore = parseInt(location.state?.answers?.[q.id]) || 0;
              return questionScore < 4; // Show recommendations for non-perfect scores
            })
            .map(q => {
              const currentScore = parseInt(location.state?.answers?.[q.id]) || 0;
              return q.options[currentScore - 1]?.recommendation;
            })
            .filter(Boolean);

          return recommendations?.length ? (
            <div 
              key={score.category} 
              className={`recommendation-card ${score.focus ? 'focus-area' : ''}`}
            >
              <div className="recommendation-header">
                <h4>{score.category}</h4>
                <div className="recommendation-meta">
                  {score.focus && <span className="focus-tag">Focus Area</span>}
                  <span className="score-tag">
                    Score: {score.score.toFixed(1)} / {score.maxScore.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="recommendation-list">
                {recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <div className={`rec-type ${rec.type}`}>{rec.type}</div>
                    <a 
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rec-link"
                    >
                      {rec.text}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })}
      </div>

      <div className="results-actions">
        <button 
          onClick={() => {
            sessionStorage.clear();
            navigate('/');
          }}
          className="restart-button"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default Results;