import { StorageState } from '../../types';
import { StorageManager } from './storageManager';

const BATCH_INTERVAL = 1000; // 1 second
const SESSION_TIMEOUT = 1800000; // 30 minutes

interface PendingChange {
  state: StorageState;
  timestamp: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private storageManager: StorageManager;
  private pendingChanges: PendingChange[];
  private batchTimeout: NodeJS.Timeout | null;
  private lastActivity: number;
  private sessionCheckInterval: NodeJS.Timeout;

  private constructor() {
    this.storageManager = StorageManager.getInstance();
    this.pendingChanges = [];
    this.batchTimeout = null;
    this.lastActivity = Date.now();
    this.sessionCheckInterval = setInterval(this.checkSession, 60000);
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async queueChange(state: StorageState): Promise<boolean> {
    this.updateLastActivity();
    
    this.pendingChanges.push({
      state,
      timestamp: Date.now()
    });

    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.processBatch(), BATCH_INTERVAL);
    }

    return true;
  }

  private async processBatch(): Promise<void> {
    if (this.pendingChanges.length === 0) return;

    // Get the most recent state from pending changes
    const mostRecent = this.pendingChanges.reduce((latest, current) => {
      return current.timestamp > latest.timestamp ? current : latest;
    });

    // Clear pending changes and timeout
    this.pendingChanges = [];
    this.batchTimeout = null;

    try {
      await this.storageManager.saveState(mostRecent.state);
    } catch (error) {
      console.error('Failed to process batch:', error);
      // Re-queue failed changes
      this.pendingChanges.push(mostRecent);
      this.batchTimeout = setTimeout(() => this.processBatch(), BATCH_INTERVAL);
    }
  }

  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  private checkSession = (): void => {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      this.endSession();
    }
  }

  async endSession(): Promise<void> {
    // Process any remaining changes
    await this.processBatch();
    
    // Clear intervals and timeouts
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Clear storage
    this.storageManager.clearStorage();
  }

  isSessionActive(): boolean {
    return Date.now() - this.lastActivity <= SESSION_TIMEOUT;
  }

  getTimeUntilExpiration(): number {
    return Math.max(0, SESSION_TIMEOUT - (Date.now() - this.lastActivity));
  }

  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
  }
}