import React, { useMemo, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAssessmentData } from '../utils/storage';
import ProgressTracker from './ProgressTracker';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { STAGE_CONFIG } from '../data/stages';
import { categories } from '../data/categories';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Lazy load Chart.js component
const RadarChart = lazy(() => import('react-chartjs-2').then(module => ({
  default: module.Radar
})));

const QUICK_START_TEMPLATES = {
  'pre-seed': [
    {
      name: 'Basic CI Pipeline',
      link: 'https://github.com/actions/starter-workflows/blob/main/ci/node.js.yml',
      icon: '⚡'
    },
    {
      name: 'Branch Protection',
      link: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-a-branch-protection-rule',
      icon: '🛡️'
    }
  ],
  'series-a': [
    {
      name: 'Security Starter Kit',
      link: 'https://github.com/startups/security',
      icon: '🔒'
    },
    {
      name: 'Team Management',
      link: 'https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories',
      icon: '👥'
    }
  ],
  'series-b': [
    {
      name: 'Enterprise Scale',
      link: 'https://docs.github.com/en/enterprise-cloud@latest/admin/overview',
      icon: '🏢'
    },
    {
      name: 'Advanced Security',
      link: 'https://docs.github.com/en/code-security',
      icon: '🔐'
    }
  ]
};

const STAGE_BENCHMARKS = {
  'pre-seed': {
    'GitHub Usage': 1.5,
    'Team Collaboration': 1.8,
    'CI/CD & Automation': 1.9,
    'Security Essentials': 1.4
  },
  'series-a': {
    'GitHub Usage': 2.5,
    'Team Collaboration': 2.9,
    'CI/CD & Automation': 3.2,
    'Security Essentials': 2.3
  },
  'series-b': {
    'GitHub Usage': 3.2,
    'Team Collaboration': 3.5,
    'CI/CD & Automation': 3.8,
    'Security Essentials': 3.2
  }
};

const ProgressBar = ({ current, benchmark }) => (
  <div className="progress-container">
    <div className="progress-labels">
      <span>Your Score: {current.toFixed(1)}</span>
      <span>Stage Average: {benchmark.toFixed(1)}</span>
    </div>
    <div className="progress-bar">
      <div 
        className="progress-user" 
        style={{ width: `${(current/4)*100}%` }}
      />
      <div
        className="progress-benchmark"
        style={{ left: `${(benchmark/4)*100}%` }}
      />
    </div>
  </div>
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

const GITHUB_OFFERS = [
  {
    id: 'security',
    title: 'Advanced Security',
    criteria: (scores) => scores.security < 2.5,
    link: 'https://github.com/startups/security',
    badge: '50% OFF',
    description: 'Automated vulnerability detection for your repos'
  },
  {
    id: 'copilot',
    title: 'GitHub Copilot',
    criteria: (scores) => scores.automation < 3,
    link: 'https://github.com/features/copilot',
    badge: 'FREE TRIAL',
    description: 'AI-powered code completion'
  }
];

const calculateScores = (assessmentData) => {
  // Simple scoring logic - can be enhanced based on requirements
  const scores = {
    deployment: 0,
    security: 0,
    cost: 0
  };

  if (assessmentData.deployment_frequency === 'multiple_daily') scores.deployment = 100;
  else if (assessmentData.deployment_frequency === 'daily') scores.deployment = 75;
  else if (assessmentData.deployment_frequency === 'weekly') scores.deployment = 50;
  else scores.deployment = 25;

  // Calculate security score based on practices implemented
  const securityPractices = assessmentData.security_practices || [];
  scores.security = (securityPractices.length / 4) * 100;

  return scores;
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const assessmentData = getAssessmentData();

  if (Object.keys(assessmentData).length === 0) {
    navigate('/');
    return null;
  }

  const scores = calculateScores(assessmentData);

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
    labels: ['Deployment Efficiency', 'Security Practices', 'Cost Optimization'],
    datasets: [{
      label: 'Your Score',
      data: [scores.deployment, scores.security, scores.cost],
      backgroundColor: 'rgba(46, 164, 79, 0.2)',
      borderColor: '#2ea44f',
      pointBackgroundColor: '#2ea44f'
    }]
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

  const calculateStageScore = (score, category, stage) => {
    const benchmark = STAGE_BENCHMARKS[stage]?.[category] || 0;
    return {
      score,
      benchmark,
      deviation: score - benchmark
    };
  };

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
          <Suspense fallback={<div>Loading chart...</div>}>
            <RadarChart data={chartData} options={chartOptions} />
          </Suspense>
        </div>
      </div>

      <div className="quick-start-section">
        <h3>🚀 Stage-Specific Quick Starts</h3>
        <div className="template-grid">
          {QUICK_START_TEMPLATES[stage]?.map((template, index) => (
            <a 
              key={index}
              href={template.link}
              className="template-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="template-icon">{template.icon}</div>
              <div className="template-content">
                <h4>{template.name}</h4>
                <span className="template-link">Get Started →</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="github-offers">
        <h3>💡 GitHub for Startups Offers</h3>
        <div className="offer-grid">
          {GITHUB_OFFERS
            .filter(offer => offer.criteria(scores))
            .map(offer => (
              <a
                key={offer.id}
                href={offer.link}
                className="offer-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="offer-badge">{offer.badge}</div>
                <h4>{offer.title}</h4>
                <p>{offer.description}</p>
                <span className="offer-cta">Learn More →</span>
              </a>
            ))}
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

          const benchmark = STAGE_BENCHMARKS[stage]?.[score.category.toLowerCase()];

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
              {benchmark && <ProgressBar current={score.score} benchmark={benchmark} />}
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

      {scores.map((score) => {
        const stageMetrics = calculateStageScore(score.score, score.category, stage);
        return (
          <div key={score.category} className="category-score">
            <div className="score-header">
              <h4>{score.category}</h4>
              <ProgressBar 
                current={score.score} 
                benchmark={stageMetrics.benchmark} 
              />
            </div>
            {stageMetrics.deviation > 0 && (
              <div className="score-achievement">
                Performing {Math.round(stageMetrics.deviation * 100)}% above stage average
              </div>
            )}
          </div>
        );
      })}

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
      </div>aa
    </div>
  );
};

export default Results;