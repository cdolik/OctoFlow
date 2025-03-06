import { StartupStage } from '../data/questions';
import { PersonalizationData } from '../components/PersonalizationInputs';

/**
 * A lightweight analytics tracker for the OctoFlow application
 * This stores events in localStorage for basic analysis
 * In a production app, you might send these to an actual analytics service
 */

// Event types
export enum EventType {
  PageView = 'page_view',
  AssessmentStart = 'assessment_start',
  AssessmentComplete = 'assessment_complete',
  RecommendationClick = 'recommendation_click',
  ResourceView = 'resource_view',
  Export = 'export_action',
  Error = 'error'
}

// Event data interface
interface AnalyticsEvent {
  type: EventType;
  timestamp: number;
  data?: any;
}

/**
 * Track an event in the application
 */
export const trackEvent = (eventType: EventType, eventData?: any): void => {
  try {
    // Create the event object
    const event: AnalyticsEvent = {
      type: eventType,
      timestamp: Date.now(),
      data: eventData
    };

    // Get existing events from localStorage
    const existingEventsStr = localStorage.getItem('octoflow_analytics');
    const existingEvents: AnalyticsEvent[] = existingEventsStr 
      ? JSON.parse(existingEventsStr) 
      : [];

    // Add the new event
    existingEvents.push(event);

    // Limit to last 100 events to avoid storage issues
    const limitedEvents = existingEvents.slice(-100);

    // Save back to localStorage
    localStorage.setItem('octoflow_analytics', JSON.stringify(limitedEvents));

    // Also log to console in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventType, eventData);
    }
  } catch (error) {
    // Don't let analytics errors break the app
    console.error('Analytics error:', error);
  }
};

/**
 * Track assessment start
 */
export const trackAssessmentStart = (stage: StartupStage, personalizationData?: PersonalizationData): void => {
  trackEvent(EventType.AssessmentStart, { stage, personalizationData });
};

/**
 * Track assessment completion
 */
export const trackAssessmentComplete = (
  stage: StartupStage, 
  scoreCount: number, 
  totalQuestions: number, 
  overallScore: number
): void => {
  trackEvent(EventType.AssessmentComplete, { 
    stage, 
    scoreCount, 
    totalQuestions,
    completionRate: totalQuestions > 0 ? (scoreCount / totalQuestions) * 100 : 0,
    overallScore 
  });
};

/**
 * Track recommendation click
 */
export const trackRecommendationClick = (
  category: string, 
  text: string, 
  priority: string
): void => {
  trackEvent(EventType.RecommendationClick, { category, text, priority });
};

/**
 * Get analytics data as an array of events
 */
export const getAnalyticsData = (): AnalyticsEvent[] => {
  try {
    const eventsStr = localStorage.getItem('octoflow_analytics');
    return eventsStr ? JSON.parse(eventsStr) : [];
  } catch (error) {
    console.error('Error retrieving analytics data:', error);
    return [];
  }
};

/**
 * Clear all analytics data
 */
export const clearAnalyticsData = (): void => {
  localStorage.removeItem('octoflow_analytics');
}; 