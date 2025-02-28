import { useEffect, useCallback, useState } from 'react';
import { useErrorManagement } from './useErrorManagement';
import { NetworkError } from '../types/errors';
import { errorAnalytics } from '../utils/errorAnalytics';

interface OfflineQueueItem {
  id: string;
  action: () => Promise<void>;
  timestamp: string;
}

export function useOfflineError() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const { handleError } = useErrorManagement();

  const processOfflineQueue = useCallback(async () => {
    if (!navigator.onLine || offlineQueue.length === 0) return;

    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const item of queue) {
      try {
        await item.action();
        errorAnalytics.updateRecoveryStatus(item.timestamp, true, 1);
      } catch (error) {
        const networkError = new NetworkError(
          'Failed to process queued action after reconnecting',
          {
            component: 'OfflineHandler',
            action: 'processOfflineQueue',
            timestamp: new Date().toISOString()
          }
        );
        handleError(networkError);
        errorAnalytics.updateRecoveryStatus(item.timestamp, false, 1);
        
        // Re-queue failed items
        setOfflineQueue(prev => [...prev, item]);
      }
    }
  }, [offlineQueue, handleError]);

  const queueAction = useCallback((action: () => Promise<void>): string => {
    const id = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    
    setOfflineQueue(prev => [...prev, { id, action, timestamp }]);
    return id;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processOfflineQueue]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      processOfflineQueue();
    }
  }, [isOnline, processOfflineQueue]);

  return {
    isOnline,
    queueAction,
    removeFromQueue,
    queueLength: offlineQueue.length,
    processOfflineQueue
  };
}