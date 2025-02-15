import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories, tooltips } from '../data/categories';

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const answers = useMemo(() => 
    location.state?.answers || {},
    [location.state?.answers]
  );

  useEffect(() => {
    // If no answers in state, redirect back to assessment
    if (Object.keys(answers).length === 0) {
      navigate('../assessment', { replace: true });
      return;
    }

    try {
      sessionStorage.setItem('assessmentAnswers', JSON.stringify(answers));
    } catch (e) {
      console.error('Error saving answers to session storage:', e);
    }
  }, [answers, navigate]);

  const calculateCategoryScore = (categoryQuestions) => {
    const scores = categoryQuestions.map(q => parseInt(answers[q.id]) || 0);
    return scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0;
  };

  const handleEdit = (categoryIndex) => {
    try {
      sessionStorage.setItem('currentCategory', categoryIndex.toString());
      // Use relative path navigation
      navigate('../assessment', { replace: true });
    } catch (e) {
      console.error('Error saving category to session storage:', e);
    }
  };

  const handleSubmit = () => {
    const scores = categories.map(category => ({
      category: category.title,
      score: calculateCategoryScore(category.questions),
      maxScore: 4
    }));
    // Use relative path navigation
    navigate('../results', { 
      state: { scores },
      replace: true 
    });
  };

  const renderTooltip = (text) => {
    return Object.keys(tooltips).reduce((acc, term) => {
      if (text.includes(term)) {
        return acc.replace(term, `${term}*`);
      }
      return acc;
    }, text);
  };

  return (
    <div className="summary-container">
      <h2>Review Your Assessment</h2>
      <p className="summary-description">
        Review your answers below. Click "Edit" to modify any section or "View Results" to see your recommendations.
      </p>
      
      <div className="categories-review">
        {categories.map((category, index) => {
          const score = calculateCategoryScore(category.questions);
          const completion = category.questions.every(q => answers[q.id]);
          
          return (
            <div key={category.id} className={`category-summary ${completion ? 'complete' : 'incomplete'}`}>
              <div className="category-header">
                <div className="category-info">
                  <h3>{category.title}</h3>
                  <span className="category-score">
                    Score: {score.toFixed(1)} / 4.0
                  </span>
                </div>
                <button 
                  onClick={() => handleEdit(index)} 
                  className="edit-button"
                >
                  Edit Responses
                </button>
              </div>
              
              <div className="questions-summary">
                {category.questions.map(question => (
                  <div key={question.id} className="question-review">
                    <p className="question-text">
                      {renderTooltip(question.text)}
                    </p>
                    <div className="selected-answer">
                      {answers[question.id] ? (
                        <>
                          <strong>Selected:</strong> {
                            renderTooltip(
                              question.options.find(
                                opt => opt.value === answers[question.id]
                              )?.text || 'No answer'
                            )
                          }
                        </>
                      ) : (
                        <span className="no-answer">No answer provided</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-actions">
        <button 
          onClick={() => navigate('/assessment')} 
          className="back-button"
        >
          Back to Assessment
        </button>
        <button 
          onClick={handleSubmit}
          className="submit-button"
          disabled={!categories.every(cat => 
            cat.questions.every(q => answers[q.id])
          )}
        >
          View Results
        </button>
      </div>

      <div className="tooltip-legend">
        * Hover over terms with asterisks for more information
      </div>
    </div>
  );
};

export default Summary;