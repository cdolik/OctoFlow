import type { Stage, AssessmentState } from '../types';
import type { ErrorContext } from '../types/errors';

const ANALYTICS_QUEUE_KEY = 'octoflow_analytics_queue';

interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

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
    const batch = this.queue.slice(0, 10);

    try {
      await this.sendEvents(batch);
      this.queue = this.queue.slice(batch.length);
      this.saveQueue();
      
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    } catch (error) {
      console.error('Failed to process analytics queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', events);
      return;
    }
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

const analyticsManager = AnalyticsManager.getInstance();

export function trackAssessmentComplete(stage: Stage, state: AssessmentState): void {
  analyticsManager.track('assessment_complete', {
    stage,
    timeSpent: state.metadata.timeSpent,
    questionCount: state.progress.totalQuestions,
    completedCount: Object.keys(state.responses).length
  });
}

export function trackAssessmentStart(stage: Stage): void {
  analyticsManager.track('assessment_start', {
    stage,
    timestamp: new Date().toISOString()
  });
}

export function trackStageTransition(from: Stage, to: Stage): void {
  analyticsManager.track('stage_transition', {
    from,
    to,
    timestamp: new Date().toISOString()
  });
}

export function trackError(error: Error, context?: ErrorContext): void {
  analyticsManager.track('error', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context
  });
}