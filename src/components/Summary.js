import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers } = location.state || {};

  const handleEdit = (categoryIndex) => {
    navigate('/assessment');
    sessionStorage.setItem('currentCategory', categoryIndex.toString());
  };

  const handleSubmit = () => {
    const scores = calculateScores(answers);
    navigate('/results', { state: { scores } });
    // Clear session storage after submission
    sessionStorage.removeItem('assessmentAnswers');
    sessionStorage.removeItem('currentCategory');
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

  if (!answers) {
    navigate('/assessment');
    return null;
  }

  return (
    <div className="summary-container">
      <h2>Review Your Responses</h2>
      <div className="summary-content">
        {categories.map((category, index) => (
          <div key={category.id} className="category-summary">
            <h3>{category.title}</h3>
            {category.questions.map(question => (
              <div key={question.id} className="response-review">
                <p className="question-text">{question.text}</p>
                <p className="answer-text">
                  Your answer: {
                    question.options.find(opt => opt.value === answers[question.id])?.text || 'Not answered'
                  }
                </p>
              </div>
            ))}
            <button 
              onClick={() => handleEdit(index)}
              className="edit-button"
            >
              Edit {category.title} Responses
            </button>
          </div>
        ))}
      </div>
      <div className="summary-actions">
        <button onClick={() => navigate('/assessment')} className="back-button">
          Back to Assessment
        </button>
        <button onClick={handleSubmit} className="submit-button">
          Submit Assessment
        </button>
      </div>
    </div>
  );
};

export default Summary;