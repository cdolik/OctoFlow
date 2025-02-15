import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const tooltips = {
  'GitFlow': 'A branching model that uses feature, develop, release, and master branches to manage code releases.',
  'trunk-based development': 'A source control pattern where developers merge small, frequent updates to a core "trunk" or main branch.',
  'pull requests': 'Proposed changes to a repository submitted by a user and accepted or rejected by collaborators.',
  'CI process': 'Continuous Integration - automatically building and testing code changes when pushed to a repository.',
  'CD pipeline': 'Continuous Deployment - automatically deploying code changes to production after passing tests.',
  'quality gates': 'Predetermined criteria that must be met before code can progress to the next stage.',
};

const categories = [
  {
    id: 'workflow',
    title: 'GitHub Workflow',
    questions: [
      {
        id: 'branch-strategy',
        text: 'How do you manage your branching strategy?',
        options: [
          { value: 1, text: 'No specific strategy' },
          { value: 2, text: 'Basic feature branches' },
          { value: 3, text: 'Feature branches with pull requests' },
          { value: 4, text: 'GitFlow or trunk-based development' }
        ]
      },
      {
        id: 'pr-review',
        text: 'What is your pull request review process?',
        options: [
          { value: 1, text: 'No formal review process' },
          { value: 2, text: 'Basic code review by team members' },
          { value: 3, text: 'Required reviews with checklists' },
          { value: 4, text: 'Automated checks and required reviews' }
        ]
      }
    ]
  },
  {
    id: 'automation',
    title: 'CI/CD Automation',
    questions: [
      {
        id: 'ci-practices',
        text: 'How automated is your CI process?',
        options: [
          { value: 1, text: 'Manual builds and tests' },
          { value: 2, text: 'Basic automated builds' },
          { value: 3, text: 'Automated builds and tests' },
          { value: 4, text: 'Full CI pipeline with quality gates' }
        ]
      },
      {
        id: 'deployment',
        text: 'How do you handle deployments?',
        options: [
          { value: 1, text: 'Manual deployments' },
          { value: 2, text: 'Semi-automated deployments' },
          { value: 3, text: 'Automated deployments to staging' },
          { value: 4, text: 'Fully automated CD pipeline' }
        ]
      }
    ]
  }
];

const Tooltip = ({ term }) => (
  <span className="tooltip">
    <span className="tooltip-icon">i</span>
    <span className="tooltip-text">{tooltips[term]}</span>
  </span>
);

const Assessment = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentCategory, setCurrentCategory] = useState(0);

  // Load answers from session storage on mount
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem('assessmentAnswers');
    const savedCategory = sessionStorage.getItem('currentCategory');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedCategory) {
      setCurrentCategory(Number(savedCategory));
    }
  }, []);

  // Save answers to session storage whenever they change
  useEffect(() => {
    sessionStorage.setItem('assessmentAnswers', JSON.stringify(answers));
    sessionStorage.setItem('currentCategory', currentCategory.toString());
  }, [answers, currentCategory]);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    } else {
      // Calculate scores and navigate to summary
      navigate('/summary', { state: { answers } });
    }
  };

  const calculateScores = (answers) => {
    const scores = {};
    categories.forEach(category => {
      const categoryScores = category.questions.map(q => answers[q.id] || 0);
      scores[category.id] = {
        average: categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length,
        title: category.title
      };
    });
    return scores;
  };

  const renderQuestionText = (text) => {
    return Object.keys(tooltips).reduce((acc, term) => {
      if (text.includes(term)) {
        const parts = acc.split(term);
        return parts.map((part, i) => 
          i === parts.length - 1 ? part : (
            <React.Fragment key={i}>
              {part}{term}<Tooltip term={term} />
            </React.Fragment>
          )
        );
      }
      return acc;
    }, text);
  };

  const currentQuestions = categories[currentCategory].questions;
  const progress = ((currentCategory + 1) / categories.length) * 100;

  return (
    <div className="assessment-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
        <span className="progress-text">
          Step {currentCategory + 1} of {categories.length}
        </span>
      </div>

      <div className="assessment-form">
        <h2>{categories[currentCategory].title}</h2>
        {currentQuestions.map(question => (
          <div key={question.id} className="question">
            <p>{renderQuestionText(question.text)}</p>
            <div className="options">
              {question.options.map(option => (
                <label key={option.value} className="option-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => handleAnswer(question.id, option.value)}
                  />
                  {renderQuestionText(option.text)}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="navigation-buttons">
          {currentCategory > 0 && (
            <button 
              onClick={() => setCurrentCategory(prev => prev - 1)}
              className="back-button"
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={!currentQuestions.every(q => answers[q.id])}
            className="next-button"
          >
            {currentCategory < categories.length - 1 ? 'Next' : 'Review Answers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;