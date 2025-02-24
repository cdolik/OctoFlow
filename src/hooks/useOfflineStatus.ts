import { useState, useEffect } from 'react';
import { useAudioFeedback } from '../components/AudioFeedback';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface OfflineStatus {
  isOffline: boolean;
  lastOnlineAt: Date | null;
  pendingSyncs: number;
}

export function useOfflineStatus() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOffline: !navigator.onLine,
    lastOnlineAt: navigator.onLine ? new Date() : null,
    pendingSyncs: 0
  });

  const { playSound } = useAudioFeedback();
  const { announce } = useAccessibility();

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel('sw-messages');
    
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOffline: false,
        lastOnlineAt: new Date()
      }));
      playSound('success');
      announce('Connection restored. Syncing changes...', 'polite');
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOffline: true
      }));
      playSound('error');
      announce('Connection lost. Working offline...', 'assertive');
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_STARTED') {
        setStatus(prev => ({
          ...prev,
          pendingSyncs: prev.pendingSyncs + 1
        }));
        announce('Syncing changes...', 'polite');
      } else if (event.data.type === 'SYNC_COMPLETED') {
        setStatus(prev => ({
          ...prev,
          pendingSyncs: Math.max(0, prev.pendingSyncs - 1)
        }));
        announce('Changes synced successfully', 'polite');
        playSound('success');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    broadcastChannel.addEventListener('message', handleMessage);

    // Check if we have any pending syncs
    navigator.serviceWorker?.ready.then(registration => {
      registration.sync.getTags().then(tags => {
        const syncTags = tags.filter(tag => tag.startsWith('sync-'));
        setStatus(prev => ({
          ...prev,
          pendingSyncs: syncTags.length
        }));
      });
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      broadcastChannel.close();
    };
  }, [playSound, announce]);

  return status;
}