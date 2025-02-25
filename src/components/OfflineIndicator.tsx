import React, { useEffect, useState } from 'react';
import { LiveRegion } from './LiveRegion';

interface OfflineIndicatorProps {
  onOffline?: () => void;
  onOnline?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onOffline,
  onOnline
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      onOffline?.();
    };

    const handleOnline = () => {
      setIsOffline(false);
      onOnline?.();
    };

    const handleSync = async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          setPendingSyncs(prev => prev + 1);
          await navigator.serviceWorker.ready;
          setPendingSyncs(prev => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Sync failed:', error);
          setPendingSyncs(prev => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('sync', handleSync);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('sync', handleSync);
    };
  }, [onOffline, onOnline]);

  if (!isOffline && pendingSyncs === 0) {
    return null;
  }

  return (
    <div 
      className={`offline-indicator ${isOffline ? 'offline' : 'syncing'}`}
      role="status"
    >
      <LiveRegion>
        {isOffline ? (
          <span>You are currently offline. Changes will be saved locally.</span>
        ) : pendingSyncs > 0 ? (
          <span>Syncing {pendingSyncs} pending change{pendingSyncs !== 1 ? 's' : ''}</span>
        ) : null}
      </LiveRegion>
    </div>
  );
};