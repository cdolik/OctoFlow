import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import { STAGE_CONFIG } from '../data/stages';

const trackEvent = (eventName, payload) => {
  const sessionId = sessionStorage.getItem('sessionId');
  const enhancedPayload = {
    ...payload,
    timestamp: Date.now(),
    sessionId
  };
  console.log('Analytics:', { eventName, ...enhancedPayload });
};

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState(null);

  useEffect(() => {
    const savedAnswers = location.state?.answers || JSON.parse(sessionStorage.getItem('assessmentAnswers') || '{}');
    const selectedStage = location.state?.stage || sessionStorage.getItem('selectedStage');
    
    setAnswers(savedAnswers);
    setStage(selectedStage);

    trackEvent('summary_viewed', {
      stage: selectedStage,
      totalAnswers: Object.keys(savedAnswers).length,
      categories: categories.map(cat => cat.id)
    });
  }, [location.state]);

  useEffect(() => {
    if (!stage || Object.keys(answers).length === 0) {
      navigate('/');
      return;
    }

    sessionStorage.setItem('assessmentAnswers', JSON.stringify(answers));
  }, [answers, navigate, stage]);

  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      STAGE_CONFIG[stage]?.questionFilter(q)
    )
  })).filter(cat => cat.questions.length > 0);

  const calculateCategoryScore = (categoryQuestions) => {
    const maxPossible = categoryQuestions.length * 4;
    const achieved = categoryQuestions.reduce((acc, q) => 
      acc + (parseInt(answers[q.id]) || 0), 0
    );
    return {
      raw: achieved / maxPossible,
      percentage: Math.round((achieved / maxPossible) * 100)
    };
  };

  const handleEdit = (categoryIndex) => {
    trackEvent('category_edit_started', {
      stage,
      category: categories[categoryIndex].id,
      currentAnswers: Object.keys(answers).length
    });

    sessionStorage.setItem('currentCategory', categoryIndex.toString());
    navigate('/assessment');
  };

  const handleSubmit = () => {
    const scores = filteredCategories.map(category => ({
      category: category.title,
      score: calculateCategoryScore(category.questions).raw * 4, // Scale back to 0-4
      maxScore: 4,
      focus: STAGE_CONFIG[stage].focus.includes(category.id.split('-')[0])
    }));

    trackEvent('assessment_completed', {
      stage,
      scores,
      timeSpent: Math.floor((Date.now() - parseInt(sessionStorage.getItem('assessmentStartTime'))) / 1000)
    });

    sessionStorage.setItem('assessmentCompleted', 'true');
    navigate('/results', { 
      state: { 
        scores,
        stage,
        answers
      }
    });
  };

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h2>Review Your Assessment</h2>
        <div className="stage-badge">
          {STAGE_CONFIG[stage]?.label}
        </div>
      </div>

      <p className="summary-description">
        Review your answers below. Areas of focus for your stage are highlighted.
      </p>
      
      <div className="categories-review">
        {filteredCategories.map((category, index) => {
          const { raw, percentage } = calculateCategoryScore(category.questions);
          const isFocusArea = STAGE_CONFIG[stage].focus.includes(
            category.id.split('-')[0]
          );
          
          return (
            <div 
              key={category.id} 
              className={`category-summary ${isFocusArea ? 'focus-area' : ''}`}
            >
              <div className="category-header">
                <div className="category-info">
                  <h3>{category.title}</h3>
                  <div className="score-indicator">
                    <div 
                      className="score-bar"
                      style={{ '--score-width': `${percentage}%` }}
                    />
                    <span className="score-value">
                      {(raw * 4).toFixed(1)} / 4.0
                    </span>
                  </div>
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
                      {question.text}
                    </p>
                    <div className="answer-display">
                      {answers[question.id] ? (
                        <div className="selected-answer">
                          <div className="answer-score">
                            Score: {answers[question.id]} / 4
                          </div>
                          {question.options.find(
                            opt => opt.value === answers[question.id]
                          )?.text}
                        </div>
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
          disabled={!filteredCategories.every(cat => 
            cat.questions.every(q => answers[q.id])
          )}
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default Summary;