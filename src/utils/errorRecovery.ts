import { AssessmentError, ErrorContext } from '../types/errors';
import { errorAnalytics } from './errorAnalytics';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

interface RecoveryStrategy {
  condition: (error: Error) => boolean;
  action: (error: Error) => Promise<boolean>;
  description: string;
}

class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private strategies: RecoveryStrategy[] = [];

  private constructor() {
    this.initializeDefaultStrategies();
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  private initializeDefaultStrategies(): void {
    // Network error recovery
    this.registerStrategy({
      condition: (error) => error.message.includes('network') || error.message.includes('timeout'),
      action: async () => {
        const online = await this.checkConnectivity();
        return online;
      },
      description: 'Network connectivity check'
    });

    // Storage error recovery
    this.registerStrategy({
      condition: (error) => error.message.includes('storage') || error.message.includes('quota'),
      action: async () => {
        await this.clearOldCache();
        return true;
      },
      description: 'Storage cleanup'
    });

    // Session error recovery
    this.registerStrategy({
      condition: (error) => error.message.includes('session') || error.message.includes('token'),
      action: async () => {
        return await this.refreshSession();
      },
      description: 'Session refresh'
    });
  }

  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  async attemptRecovery(error: Error, context: ErrorContext): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.condition(error)) {
        try {
          const recovered = await strategy.action(error);
          errorAnalytics.trackError(error, {
            ...context,
            action: `recovery:${strategy.description}`,
            timestamp: new Date().toISOString()
          }, recovered);
          return recovered;
        } catch (recoveryError) {
          errorAnalytics.trackError(
            new AssessmentError(`Recovery failed: ${strategy.description}`, {
              context: {
                ...context,
                action: `recovery_failed:${strategy.description}`
              },
              severity: 'high',
              recoverable: false
            }),
            context
          );
        }
      }
    }
    return false;
  }

  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
      onRetry
    } = options;

    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        
        if (attempt === maxRetries) {
          throw error;
        }

        onRetry?.(attempt, error as Error);
        
        const delay = exponentialBackoff
          ? retryDelay * Math.pow(2, attempt - 1)
          : retryDelay;
          
        await this.delay(delay);
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      await fetch('/ping', { method: 'HEAD' });
      return true;
    } catch {
      return navigator.onLine;
    }
  }

  private async clearOldCache(): Promise<void> {
    const cacheKeys = await caches.keys();
    const oldCaches = cacheKeys.filter(key => key.includes('old'));
    await Promise.all(oldCaches.map(key => caches.delete(key)));
  }

  private async refreshSession(): Promise<boolean> {
    try {
      // Implement session refresh logic
      return true;
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const errorRecovery = ErrorRecoveryManager.getInstance();