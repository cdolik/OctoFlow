import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, tooltips } from '../data/categories';
import { STAGE_CONFIG } from '../data/stages';

const Tooltip = ({ term }) => (
  <span className="tooltip">
    <span className="tooltip-icon">i</span>
    <span className="tooltip-text">{tooltips[term]}</span>
  </span>
);

const trackEvent = (eventName, payload) => {
  const enhancedPayload = {
    ...payload,
    timestamp: Date.now(),
    userAgent: window.navigator.userAgent,
    sessionId: sessionStorage.getItem('sessionId') || Math.random().toString(36).substring(7)
  };
  
  // Basic console logging for development
  console.log('Analytics:', { eventName, ...enhancedPayload });
  
  // Store sessionId if not exists
  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', enhancedPayload.sessionId);
  }
};

const Assessment = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentCategory, setCurrentCategory] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [stage, setStage] = useState(null);

  useEffect(() => {
    const selectedStage = sessionStorage.getItem('selectedStage');
    if (!selectedStage) {
      navigate('/');
      return;
    }
    setStage(selectedStage);

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
  }, [navigate]);

  useEffect(() => {
    if (!initialized) return;
    
    try {
      sessionStorage.setItem('assessmentAnswers', JSON.stringify(answers));
      sessionStorage.setItem('currentCategory', currentCategory.toString());
    } catch (e) {
      console.error('Error saving to session storage:', e);
    }
  }, [answers, currentCategory, initialized]);

  useEffect(() => {
    const startTime = Date.now();
    const sessionId = Math.random().toString(36).substring(7);
    
    sessionStorage.setItem('assessmentStartTime', startTime.toString());
    sessionStorage.setItem('sessionId', sessionId);
    
    trackEvent('assessment_started', {
      stage: sessionStorage.getItem('selectedStage'),
      startTime,
      totalQuestions: categories.reduce((acc, cat) => acc + cat.questions.length, 0)
    });
    
    return () => {
      // Track if assessment is abandoned
      const isCompleted = sessionStorage.getItem('assessmentCompleted');
      if (!isCompleted) {
        trackEvent('assessment_abandoned', {
          stage: sessionStorage.getItem('selectedStage'),
          lastCategory: currentCategory,
          progress: `${currentCategory + 1}/${categories.length}`,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          completedQuestions: Object.keys(answers).length
        });
      }
    };
  }, []);

  const handleAnswer = (questionId, value) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(updatedAnswers);
    sessionStorage.setItem('assessmentAnswers', JSON.stringify(updatedAnswers));

    const currentQuestion = categories[currentCategory].questions.find(q => q.id === questionId);
    
    trackEvent('question_answered', {
      questionId,
      value,
      category: categories[currentCategory].id,
      categoryTitle: categories[currentCategory].title,
      stage: sessionStorage.getItem('selectedStage'),
      questionText: currentQuestion?.text,
      timeSpent: Math.floor((Date.now() - (sessionStorage.getItem('lastQuestionTime') || Date.now())) / 1000)
    });
    
    sessionStorage.setItem('lastQuestionTime', Date.now().toString());
  };

  // Filter questions based on company stage
  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      STAGE_CONFIG[stage]?.questionFilter(q)
    )
  })).filter(cat => cat.questions.length > 0);

  const handleNext = () => {
    if (currentCategory < filteredCategories.length - 1) {
      setCurrentCategory(prev => {
        const next = prev + 1;
        sessionStorage.setItem('currentCategory', next.toString());
        
        trackEvent('assessment_progress', {
          fromCategory: prev,
          toCategory: next,
          totalCategories: categories.length,
          stage: sessionStorage.getItem('selectedStage')
        });
        
        return next;
      });
    } else {
      navigate('/summary', { 
        state: { 
          answers,
          stage 
        }
      });
    }
  };

  const handleBack = () => {
    if (currentCategory > 0) {
      setCurrentCategory(prev => {
        const next = prev - 1;
        sessionStorage.setItem('currentCategory', next.toString());
        
        trackEvent('assessment_navigation', {
          direction: 'back',
          fromCategory: prev,
          toCategory: next,
          stage: sessionStorage.getItem('selectedStage')
        });
        
        return next;
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

  const currentQuestions = filteredCategories[currentCategory]?.questions || [];
  const progress = ((currentCategory + 1) / filteredCategories.length) * 100;
  
  // Calculate completion status for current category
  const isCategoryComplete = currentQuestions.every(q => answers[q.id]);

  return (
    <div className="assessment-container">
      <div className="stage-indicator">
        <span className="stage-label">{STAGE_CONFIG[stage]?.label}</span>
        <span className="stage-focus">
          Focus: {STAGE_CONFIG[stage]?.focus.join(', ')}
        </span>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-text">
            Step {currentCategory + 1} of {filteredCategories.length}
          </span>
          <span className="category-title">
            {filteredCategories[currentCategory]?.title}
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
              onClick={handleBack}
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
            {currentCategory < filteredCategories.length - 1 ? 'Next' : 'Review Answers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;