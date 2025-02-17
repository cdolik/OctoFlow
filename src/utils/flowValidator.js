import { validateSessionStorage, validateAnalytics, simulateError } from './testUtils';
import { trackStageSelect, trackQuestionAnswer, trackAssessmentComplete } from './analytics';

export const validateUserFlow = () => {
  const analytics = validateAnalytics();
  const issues = [];
  
  // 1. Test Session Storage
  if (!validateSessionStorage()) {
    issues.push('SessionStorage not working correctly');
  }

  // 2. Test Analytics Events
  try {
    trackStageSelect('pre-seed');
    trackQuestionAnswer('sec-1', 3);
    trackAssessmentComplete({ collaboration: 3, security: 4 });
    
    const events = analytics.getEvents();
    if (!events.some(e => e.msg.includes('stage_selected'))) {
      issues.push('Stage selection analytics not firing');
    }
  } finally {
    analytics.restore();
  }

  return {
    issues,
    hasErrors: issues.length > 0
  };
};

export const validateResponses = () => {
  const responses = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
  return {
    isComplete: Object.keys(responses).length > 0,
    responses
  };
};

export const simulateComponentError = (component) => {
  switch (component) {
    case 'Assessment':
      throw new Error('Simulated Assessment error');
    case 'Results':
      throw new Error('Simulated Results error');
    default:
      throw new Error('Unknown component error');
  }
};