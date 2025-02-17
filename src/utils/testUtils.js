import { getAssessmentResponses, getStoredScores } from '../utils/storage';
import { categories, stageConfiguration } from '../data/categories';
import { GITHUB_GLOSSARY } from '../data/GITHUB_GLOSSARY';

// Testing utilities for OctoFlow
export const mockAssessmentResponse = {
  'sec-1': 3,
  'eco-1': 2,
  'auto-1': 4
};

export const simulateError = () => {
  throw new Error('Simulated error for testing');
};

export const validateSessionStorage = () => {
  const testKey = 'test-response';
  const testValue = { id: 'test', score: 3 };
  
  try {
    // Test writing
    sessionStorage.setItem(testKey, JSON.stringify(testValue));
    
    // Test reading
    const stored = JSON.parse(sessionStorage.getItem(testKey));
    
    // Cleanup
    sessionStorage.removeItem(testKey);
    
    return stored.id === testValue.id && stored.score === testValue.score;
  } catch (error) {
    console.error('SessionStorage validation failed:', error);
    return false;
  }
};

export const validateAnalytics = () => {
  let events = [];
  
  // Override console.log temporarily
  const originalLog = console.log;
  console.log = (msg, data) => {
    if (msg.startsWith('[Analytics]')) {
      events.push({ msg, data });
    }
  };
  
  return {
    getEvents: () => events,
    restore: () => {
      console.log = originalLog;
    }
  };
};

export const validateImplementation = () => {
  const validationResults = {
    issues: [],
    warnings: []
  };

  // 1. Validate Category Structure
  categories.forEach(category => {
    if (!category.weight || category.weight <= 0) {
      validationResults.issues.push(`Invalid weight for category: ${category.id}`);
    }
    if (!category.questions || category.questions.length === 0) {
      validationResults.issues.push(`No questions found for category: ${category.id}`);
    }
  });

  // 2. Validate Stage Configuration
  Object.entries(stageConfiguration).forEach(([stage, config]) => {
    if (!config.focusCategories || config.focusCategories.length === 0) {
      validationResults.warnings.push(`No focus categories defined for stage: ${stage}`);
    }
  });

  // 3. Validate Tooltips
  const tooltipTerms = new Set();
  categories.forEach(category => {
    category.questions.forEach(question => {
      if (question.tooltipTerm && !GITHUB_GLOSSARY[question.tooltipTerm]) {
        validationResults.issues.push(`Missing glossary entry for term: ${question.tooltipTerm}`);
      }
      if (question.tooltipTerm) {
        tooltipTerms.add(question.tooltipTerm);
      }
    });
  });

  // 4. Validate Storage Integration
  try {
    const testResponse = { 'test-id': 1 };
    sessionStorage.setItem('test', JSON.stringify(testResponse));
    sessionStorage.removeItem('test');
  } catch (error) {
    validationResults.issues.push('SessionStorage not available');
  }

  return validationResults;
};

export const simulateAssessmentFlow = async (stage = 'pre-seed') => {
  const flowResults = {
    events: [],
    errors: []
  };

  try {
    // 1. Start Assessment
    const stageQuestions = categories.flatMap(cat => cat.questions);
    
    // 2. Answer Questions
    stageQuestions.forEach((question, index) => {
      const mockAnswer = Math.floor(Math.random() * 4) + 1;
      flowResults.events.push({
        step: `Question ${index + 1}`,
        questionId: question.id,
        answer: mockAnswer
      });
    });

    // 3. Verify Storage
    const responses = getAssessmentResponses();
    const scores = getStoredScores();

    if (!responses || Object.keys(responses).length === 0) {
      flowResults.errors.push('Responses not properly stored');
    }
    if (!scores) {
      flowResults.errors.push('Scores not calculated/stored');
    }

  } catch (error) {
    flowResults.errors.push(`Flow error: ${error.message}`);
  }

  return flowResults;
};