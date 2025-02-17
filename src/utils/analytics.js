const ANALYTICS_VERSION = '1.0.0';

// Base logging function
const logEvent = (eventName, data) => {
  const event = {
    version: ANALYTICS_VERSION,
    event: eventName,
    data: data
  };
  
  // For MVP, log to console
  console.log('[OctoFlow Analytics]', event);
  
  // Store events in sessionStorage for analysis
  const events = JSON.parse(sessionStorage.getItem('octoflow_analytics') || '[]');
  events.push(event);
  sessionStorage.setItem('octoflow_analytics', JSON.stringify(events));
};

// Track assessment flow events
export const trackStageSelect = (stage) => {
  logEvent('stage_selected', { stage });
};

export const trackAssessmentStart = (stage) => {
  logEvent('assessment_started', { stage, timestamp: Date.now() });
};

export const trackCategoryComplete = (categoryId, averageScore) => {
  logEvent('category_completed', { 
    categoryId, 
    averageScore,
    timestamp: Date.now()
  });
};

export const trackQuestionAnswer = (questionId, answer, timeSpent) => {
  logEvent('question_answered', {
    questionId,
    answer,
    timeSpent,
    timestamp: Date.now()
  });
};

export const trackAssessmentComplete = (scores, stage) => {
  logEvent('assessment_completed', {
    stage,
    overallScore: scores.overallScore,
    categoryScores: scores.categoryScores,
    completionRate: scores.completionRate,
    timestamp: Date.now()
  });
};

export const trackResourceClick = (resourceType, url) => {
  logEvent('resource_clicked', {
    resourceType,
    url,
    timestamp: Date.now()
  });
};

export const trackCTAClick = (ctaType) => {
  logEvent('cta_clicked', { type: ctaType });
};

// Feedback collection
export const submitFeedback = async (feedback) => {
  logEvent('feedback_submitted', {
    ...feedback,
    timestamp: Date.now()
  });
  
  // For MVP, log to console - can be replaced with actual API call later
  console.info('User Feedback:', feedback);
};

// Error tracking
export const trackError = (errorType, details) => {
  logEvent('error_occurred', {
    errorType,
    details,
    timestamp: Date.now()
  });
};