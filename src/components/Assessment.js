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
  const [initialized, setInitialized] = useState(false);

  // Enhanced session storage handling
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem('assessmentAnswers');
    const savedCategory = sessionStorage.getItem('currentCategory');
    
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
      } catch (e) {
        console.error('Error parsing saved answers:', e);
        sessionStorage.removeItem('assessmentAnswers');
      }
    }
    
    if (savedCategory) {
      const categoryNum = Number(savedCategory);
      if (!isNaN(categoryNum) && categoryNum >= 0 && categoryNum < categories.length) {
        setCurrentCategory(categoryNum);
      }
    }
    
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    
    try {
      sessionStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      sessionStorage.setItem('currentCategory', currentCategory.toString());
    } catch (e) {
      console.error('Error saving to session storage:', e);
    }
  }, [answers, currentCategory, initialized]);

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
      // Use relative path for navigation
      navigate('../summary', { 
        state: { answers },
        replace: true 
      });
    }
  };

  const renderQuestionText = (text) => {
    return Object.keys(tooltips).reduce((acc, term) => {
      if (text.includes(term)) {
        const parts = acc.split(term);
        return parts.map((part, i) => 
          i === parts.length - 1 ? part : (
            <React.Fragment key={i}>
              {part}<strong>{term}</strong><Tooltip term={term} />
            </React.Fragment>
          )
        );
      }
      return acc;
    }, text);
  };

  const currentQuestions = categories[currentCategory].questions;
  const progress = ((currentCategory + 1) / categories.length) * 100;
  
  // Calculate completion status for current category
  const isCategoryComplete = currentQuestions.every(q => answers[q.id]);

  return (
    <div className="assessment-container">
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-text">
            Step {currentCategory + 1} of {categories.length}
          </span>
          <span className="category-title">
            {categories[currentCategory].title}
          </span>
        </div>
      </div>

      <div className="assessment-form">
        {currentQuestions.map(question => (
          <div key={question.id} className="question-card">
            <p className="question-text">{renderQuestionText(question.text)}</p>
            <div className="options-grid">
              {question.options.map(option => (
                <label 
                  key={option.value} 
                  className={`option-card ${answers[question.id] === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => handleAnswer(question.id, option.value)}
                  />
                  <span className="option-text">
                    {renderQuestionText(option.text)}
                  </span>
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
            disabled={!isCategoryComplete}
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