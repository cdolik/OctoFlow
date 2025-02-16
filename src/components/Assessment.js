import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressTracker from './ProgressTracker';
import { persistResponse, getAssessmentData } from '../utils/storage';
import './styles.css';

const AssessmentSteps = [
  {
    id: 'deployment_frequency',
    question: 'How often does your team deploy to production?',
    options: [
      { value: 'multiple_daily', label: 'Multiple times per day' },
      { value: 'daily', label: 'Once per day' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly or less' }
    ]
  },
  {
    id: 'security_practices',
    question: 'Which security practices do you currently employ?',
    options: [
      { value: 'code_scanning', label: 'Automated code scanning' },
      { value: 'secret_scanning', label: 'Secret scanning' },
      { value: 'dep_review', label: 'Dependency review' },
      { value: 'none', label: 'None of the above' }
    ],
    multiple: true
  }
  // More questions can be added here
];

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(getAssessmentData());

  const handleAnswer = (value) => {
    const questionId = AssessmentSteps[currentStep].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    persistResponse(questionId, value);

    if (currentStep < AssessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/summary');
    }
  };

  const currentQuestion = AssessmentSteps[currentStep];

  return (
    <div className="assessment-container">
      <ProgressTracker currentQuestion={currentStep + 1} />
      
      <div className="question-card">
        <h2>{currentQuestion.question}</h2>
        <div className="options-grid">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              className="option-button"
              onClick={() => handleAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessment;