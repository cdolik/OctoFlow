// Simple analytics logging for early feedback collection

const logEvent = (eventName, data = {}) => {
  console.log(`[Analytics] ${eventName}:`, data);
  // This could later be replaced with a proper analytics solution
};

export const trackPageView = (pageName) => {
  logEvent('page_view', { page: pageName });
};

export const trackAssessmentStart = (startupStage) => {
  logEvent('assessment_start', { stage: startupStage });
};

export const trackAssessmentComplete = (scores) => {
  logEvent('assessment_complete', { scores });
};

export const trackRecommendationClick = (recommendationType) => {
  logEvent('recommendation_click', { type: recommendationType });
};