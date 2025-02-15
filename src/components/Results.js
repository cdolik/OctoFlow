import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const getDevOpsRecommendations = (score) => {
  if (score < 2) {
    return {
      level: 'Foundational',
      recommendations: [
        {
          text: 'Set up basic branching strategy',
          link: 'https://docs.github.com/en/get-started/quickstart/github-flow'
        },
        {
          text: 'Implement pull request reviews',
          link: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews'
        }
      ]
    };
  } else if (score < 3) {
    return {
      level: 'Intermediate',
      recommendations: [
        {
          text: 'Add automated CI checks',
          link: 'https://docs.github.com/en/actions/automating-builds-and-tests'
        },
        {
          text: 'Implement branch protection rules',
          link: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches'
        }
      ]
    };
  } else {
    return {
      level: 'Advanced',
      recommendations: [
        {
          text: 'Set up automated deployments',
          link: 'https://docs.github.com/en/actions/deployment/about-deployments'
        },
        {
          text: 'Implement code quality gates',
          link: 'https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning'
        }
      ]
    };
  }
};

const Results = () => {
  const location = useLocation();
  const scores = location.state ? location.state.scores : null;

  if (!scores) {
    return (
      <div className="error-state">
        <h2>No assessment data found</h2>
        <Link to="/assessment">Take the Assessment</Link>
      </div>
    );
  }

  const overallScore = Object.values(scores).reduce((acc, { average }, _, { length }) => acc + average / length, 0);

  return (
    <div className="results-container">
      <h2>Your DevOps Assessment Results</h2>
      <div className="overall-score">
        <h3>Overall Score: {overallScore.toFixed(1)} / 4</h3>
        <p>Here's how you scored in each category:</p>
      </div>

      <div className="category-scores">
        {Object.entries(scores).map(([categoryId, { average, title }]) => {
          const { level, recommendations } = getDevOpsRecommendations(average);
          return (
            <div key={categoryId} className="category-score">
              <h4>{title}</h4>
              <p>Score: {average.toFixed(1)} / 4</p>
              <p>Level: {level}</p>
              <div className="recommendations">
                <h5>Next Steps:</h5>
                <ul>
                  {recommendations.map((rec, index) => (
                    <li key={index}>
                      <a href={rec.link} target="_blank" rel="noopener noreferrer">
                        {rec.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <Link to="/assessment" className="retake-button">
        Retake Assessment
      </Link>
    </div>
  );
};

export default Results;