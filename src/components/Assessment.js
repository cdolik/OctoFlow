import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, tooltips } from '../data/categories';

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