import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Assessment = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentCategory, setCurrentCategory] = useState(0);

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
      // Calculate scores and navigate to results
      const scores = calculateScores(answers);
      navigate('/results', { state: { scores } });
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

  const currentQuestions = categories[currentCategory].questions;

  return (
    <div className="assessment-form">
      <h2>{categories[currentCategory].title}</h2>
      {currentQuestions.map(question => (
        <div key={question.id} className="question">
          <p>{question.text}</p>
          <div className="options">
            {question.options.map(option => (
              <label key={option.value}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button 
        onClick={handleNext}
        disabled={!currentQuestions.every(q => answers[q.id])}
      >
        {currentCategory < categories.length - 1 ? 'Next' : 'View Results'}
      </button>
    </div>
  );
};

export default Assessment;