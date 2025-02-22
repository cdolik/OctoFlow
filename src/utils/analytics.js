// Base logging function
const logEvent = (eventName, data) => {
  const baseData = {
    timestamp: Date.now(),
    sessionId: getSessionId(),
    flowState: getCurrentFlowState(),
    userAgent: navigator.userAgent
  };

  console.log(`[Analytics] ${eventName}:`, {
    ...baseData,
    ...data
  });
  // Future integration point for real analytics service
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('octoflow_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('octoflow_session', sessionId);
  }
  return sessionId;
};

const getCurrentFlowState = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    return {
      stage: state.stage,
      currentState: state.currentState,
      progress: state.metadata?.questionCount || 0,
      lastInteraction: state.metadata?.lastInteraction
    };
  } catch {
    return {};
  }
};

// Track assessment flow events
export const trackStageSelect = (stage) => {
  logEvent('stage_selected', { 
    stage,
    source: window.location.pathname
  });
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
    isCorrection: isAnswerCorrection(questionId)
  });
};

export const trackAssessmentComplete = (scores, stage) => {
  logEvent('assessment_completed', { 
    scores,
    stage,
    completionTime: getAssessmentDuration(),
    questionCount: Object.keys(scores).length
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
    type: errorType,
    details,
    currentRoute: window.location.pathname,
    errorCount: getErrorCount()
  });
};

export const trackNavigation = (from, to) => {
  logEvent('navigation', {
    from,
    to,
    timestamp: Date.now()
  });
};

export const trackRecommendationClick = (recommendationId, category) => {
  logEvent('recommendation_clicked', {
    recommendationId,
    category,
    context: getCurrentAssessmentContext()
  });
};

export const trackInteractionPattern = (questionId, interactionType, details) => {
  logEvent('user_interaction', {
    questionId,
    type: interactionType,
    details,
    durationSinceLastInteraction: getTimeSinceLastInteraction()
  });
  updateLastInteraction();
};

export const trackTimeOnQuestion = (questionId, timeSpent, wasModified) => {
  logEvent('question_time', {
    questionId,
    timeSpent,
    wasModified,
    averageTimeForStage: getAverageTimeForCurrentStage()
  });
};

export const trackNavigationFlow = (from, to, trigger) => {
  logEvent('navigation', {
    from,
    to,
    trigger,
    totalAssessmentTime: getTotalAssessmentTime()
  });
};

// Enhanced error tracking
export const trackErrorWithRecovery = (error, recoveryAttempted, recovered) => {
  logEvent('error_with_recovery', {
    type: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    recoveryAttempted,
    recovered,
    sessionContext: getCurrentSessionContext(),
    errorCount: getErrorCount()
  });
};

// Session management tracking
export const trackSessionRestore = (success, source) => {
  logEvent('session_restore', {
    success,
    source, // 'sessionStorage' or 'localStorage'
    timestamp: Date.now(),
    sessionAge: getSessionAge()
  });
};

export const trackAutoSave = (success, dataSize) => {
  logEvent('auto_save', {
    success,
    dataSize,
    timestamp: Date.now(),
    saveDuration: getLastSaveDuration()
  });
};

// Enhanced progress tracking
export const trackProgressUpdate = (progress, category) => {
  logEvent('progress_update', {
    progress,
    category,
    timeSpent: getTimeInCategory(category),
    totalTime: getTotalAssessmentTime()
  });
};

// Performance metrics
export const trackPerformanceMetric = (metric) => {
  logEvent('performance_metric', {
    ...metric,
    timestamp: Date.now(),
    deviceMemory: navigator.deviceMemory,
    connection: getConnectionInfo()
  });
};

// Session health checks
export const trackSessionHealth = () => {
  logEvent('session_health', {
    storageSize: getStorageSize(),
    lastSaveTime: getLastSaveTime(),
    sessionErrors: getSessionErrors(),
    connectionStatus: navigator.onLine
  });
};

export const trackStageTransition = (fromStage, toStage) => {
  logEvent('stage_transition', {
    from: fromStage,
    to: toStage,
    timestamp: Date.now()
  });
};

const isAnswerCorrection = (questionId) => {
  try {
    const responses = JSON.parse(sessionStorage.getItem('octoflow'))?.responses || {};
    return questionId in responses;
  } catch (e) {
    return false;
  }
};

const getAssessmentDuration = () => {
  try {
    const metadata = JSON.parse(sessionStorage.getItem('octoflow'))?.metadata || {};
    return metadata.startTime ? Date.now() - metadata.startTime : 0;
  } catch (e) {
    return 0;
  }
};

const getErrorCount = () => {
  try {
    const metadata = JSON.parse(sessionStorage.getItem('octoflow'))?.metadata || {};
    return (metadata.errorCount || 0) + 1;
  } catch (e) {
    return 1;
  }
};

const getCurrentAssessmentContext = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    return {
      stage: state.stage,
      progress: state.metadata?.questionCount || 0,
      lastAction: state.metadata?.lastAction
    };
  } catch (e) {
    return {};
  }
};

const getTimeSinceLastInteraction = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow'));
    return state?.metadata?.lastInteraction ? 
      Date.now() - state.metadata.lastInteraction : 
      null;
  } catch {
    return null;
  }
};

const updateLastInteraction = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    state.metadata = {
      ...state.metadata,
      lastInteraction: Date.now()
    };
    sessionStorage.setItem('octoflow', JSON.stringify(state));
  } catch {
    // Fail silently - analytics should not break the app
  }
};

const getAverageTimeForCurrentStage = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    const times = state.metadata?.questionTimes || [];
    if (times.length === 0) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  } catch {
    return null;
  }
};

const getTotalAssessmentTime = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow'));
    return state?.metadata?.startTime ? 
      Date.now() - state.metadata.startTime : 
      null;
  } catch {
    return null;
  }
};

const getSessionAge = () => {
  try {
    const session = JSON.parse(sessionStorage.getItem('octoflow_session'));
    return session?.timestamp ? Date.now() - session.timestamp : null;
  } catch {
    return null;
  }
};

const getLastSaveDuration = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    return state.metadata?.lastSaveDuration || null;
  } catch {
    return null;
  }
};

const getTimeInCategory = (category) => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    const categoryTimes = state.metadata?.categoryTimes || {};
    return categoryTimes[category] || 0;
  } catch {
    return 0;
  }
};

const getConnectionInfo = () => {
  if (!navigator.connection) return null;
  return {
    type: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink,
    rtt: navigator.connection.rtt
  };
};

const getStorageSize = () => {
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

const getLastSaveTime = () => {
  try {
    const state = JSON.parse(sessionStorage.getItem('octoflow')) || {};
    return state.metadata?.lastSave || null;
  } catch {
    return null;
  }
};

const getSessionErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('octoflow_errors') || '[]');
  } catch {
    return [];
  }
};

const getCurrentSessionContext = () => {
  return {
    ...getCurrentFlowState(),
    storageHealth: getStorageSize() !== null,
    hasLocalStorageBackup: !!localStorage.getItem('octoflow_session_backup'),
    errorCount: getSessionErrors().length
  };
};