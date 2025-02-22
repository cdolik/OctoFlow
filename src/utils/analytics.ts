import { Stage } from '../types';

interface AnalyticsEvent {
  timestamp: number;
  sessionId: string;
  flowState: FlowState;
  userAgent: string;
}

interface FlowState {
  stage?: Stage;
  currentState?: string;
  progress: number;
  lastInteraction?: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

const events: AnalyticsEvent[] = [];

const logEvent = (eventName: string, data: Record<string, unknown>): void => {
  const baseData: AnalyticsEvent = {
    timestamp: Date.now(),
    sessionId: getSessionId(),
    flowState: getCurrentFlowState(),
    userAgent: navigator.userAgent
  };
  console.log(`[Analytics] ${eventName}:`, {
    ...baseData,
    ...data
  });
  events.push(baseData);
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('octoflow_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('octoflow_session', sessionId);
  }
  return sessionId;
};

const getCurrentFlowState = (): FlowState => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
    return {
      stage: state.stage,
      currentState: state.currentState,
      progress: state.metadata?.questionCount || 0,
      lastInteraction: state.metadata?.lastInteraction
    };
  } catch {
    return { progress: 0 };
  }
};

export const trackStageSelect = (stage: Stage): void => {
  logEvent('stage_selected', { 
    stage,
    source: window.location.pathname
  });
};

export const trackAssessmentStart = (stage: Stage): void => {
  logEvent('assessment_started', { stage, timestamp: Date.now() });
};

export const trackCategoryComplete = (categoryId: string, averageScore: number): void => {
  logEvent('category_completed', { 
    categoryId, 
    averageScore,
    timestamp: Date.now()
  });
};

export const trackQuestionAnswer = (
  questionId: string,
  answer: number,
  timeSpent: number
): void => {
  logEvent('question_answered', { 
    questionId, 
    answer,
    timeSpent,
    isCorrection: isAnswerCorrection(questionId)
  });
};

export const trackAssessmentComplete = (
  scores: Record<string, number>,
  stage: Stage
): void => {
  logEvent('assessment_completed', { 
    scores,
    stage,
    completionTime: getAssessmentDuration(),
    questionCount: Object.keys(scores).length
  });
};

export const trackResourceClick = (resourceType: string, url: string): void => {
  logEvent('resource_clicked', {
    resourceType,
    url,
    timestamp: Date.now()
  });
};

export const trackError = (error: Error, context?: Record<string, unknown>): void => {
  logEvent('error_occurred', {
    type: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    currentRoute: window.location.pathname,
    errorCount: getErrorCount(),
    ...context
  });
};

export const trackStageTransition = (fromStage: Stage | null, toStage: Stage): void => {
  logEvent('stage_transition', {
    from: fromStage,
    to: toStage,
    timestamp: Date.now()
  });
};

const isAnswerCorrection = (questionId: string): boolean => {
  try {
    const responses = JSON.parse(sessionStorage.getItem('octoflow') || '{}')?.responses || {};
    return questionId in responses;
  } catch {
    return false;
  }
};

const getAssessmentDuration = (): number => {
  try {
    const metadata = JSON.parse(sessionStorage.getItem('octoflow') || '{}')?.metadata || {};
    return metadata.startTime ? Date.now() - metadata.startTime : 0;
  } catch {
    return 0;
  }
};

const getErrorCount = (): number => {
  try {
    const metadata = JSON.parse(sessionStorage.getItem('octoflow') || '{}')?.metadata || {};
    return (metadata.errorCount || 0) + 1;
  } catch {
    return 1;
  }
};

const getCurrentAssessmentContext = (): AssessmentContext => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
    return {
      stage: state.stage,
      progress: state.metadata?.questionCount || 0,
      lastAction: state.metadata?.lastAction
    };
  } catch {
    return { progress: 0 };
  }
};

const getTimeSinceLastInteraction = (): number | null => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
    return state?.metadata?.lastInteraction ? 
      Date.now() - state.metadata.lastInteraction : 
      null;
  } catch {
    return null;
  }
};

const updateLastInteraction = (): void => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow') || '{}');
    state.metadata = {
      ...state.metadata,
      lastInteraction: Date.now()
    };
    sessionStorage.setItem('octoflow', JSON.stringify(state));
  } catch {
    // Fail silently - analytics should not break the app
  }
};

const getConnectionInfo = (): ConnectionInfo | null => {
  if (!('connection' in navigator)) return null;
  const connection = (navigator as NavigatorWithConnection).connection;
  return {
    type: connection?.effectiveType || '',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0
  };
};

const getStorageSize = (): StorageSize | null => {
  try {
    const octoflowSize = new Blob([sessionStorage.getItem('octoflow') || '']).size;
    const responsesSize = new Blob([sessionStorage.getItem('assessment_responses') || '']).size;
    return {
      octoflow: octoflowSize,
      responses: responsesSize,
      total: octoflowSize + responsesSize
    };
  } catch {
    return null;
  }
};

const getCurrentSessionContext = (): SessionContext => {
  return {
    ...getCurrentFlowState(),
    storageHealth: getStorageSize() !== null,
    hasLocalStorageBackup: !!localStorage.getItem('octoflow_session_backup'),
    errorCount: (JSON.parse(localStorage.getItem('octoflow_errors') || '[]') as unknown[]).length
  };
};

export const getAnalyticsEvents = (): AnalyticsEvent[] => [...events];

// Clear events (mainly for testing)
export const clearAnalyticsEvents = (): void => {
  events.length = 0;
};