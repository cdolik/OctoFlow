import { Stage, AssessmentState } from '../types';

interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

const ANALYTICS_QUEUE_KEY = 'octoflow_analytics_queue';

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;

  private constructor() {
    this.loadQueue();
    window.addEventListener('online', this.processQueue.bind(this));
    window.addEventListener('beforeunload', this.saveQueue.bind(this));
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private loadQueue(): void {
    try {
      const savedQueue = localStorage.getItem(ANALYTICS_QUEUE_KEY);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Failed to load analytics queue:', error);
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save analytics queue:', error);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.queue.slice(0, 10); // Process 10 events at a time

    try {
      await this.sendEvents(batch);
      this.queue = this.queue.slice(batch.length);
      this.saveQueue();
      
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000); // Process next batch after 1s
      }
    } catch (error) {
      console.error('Failed to process analytics queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // Implementation would depend on your analytics provider
    // This is a placeholder that logs to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics events:', events);
      return;
    }

    // In production, send to your analytics service
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(events)
    // });
  }

  track(name: string, properties: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date().toISOString()
    };

    this.queue.push(event);
    this.processQueue();
  }
}

// Analytics tracking functions
export function trackAssessmentComplete(stage: Stage, state: AssessmentState): void {
  const analytics = AnalyticsManager.getInstance();
  analytics.track('assessment_complete', {
    stage,
    timeSpent: state.metadata.timeSpent,
    questionCount: state.progress.totalQuestions,
    completedCount: Object.keys(state.responses).length,
    averageScore: calculateAverageScore(state)
  });
}

export function trackAssessmentStart(stage: Stage): void {
  const analytics = AnalyticsManager.getInstance();
  analytics.track('assessment_start', {
    stage,
    timestamp: new Date().toISOString()
  });
}

export function trackStageTransition(from: Stage, to: Stage): void {
  const analytics = AnalyticsManager.getInstance();
  analytics.track('stage_transition', {
    from,
    to,
    timestamp: new Date().toISOString()
  });
}

export function trackError(error: Error, context?: Record<string, unknown>): void {
  const analytics = AnalyticsManager.getInstance();
  analytics.track('error', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context
  });
}

// Helper functions
function calculateAverageScore(state: AssessmentState): number {
  const scores = Object.values(state.responses);
  if (scores.length === 0) return 0;
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}