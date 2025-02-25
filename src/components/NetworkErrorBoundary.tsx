import React, { useEffect, useState } from 'react';
import { LiveRegion } from './LiveRegion';
import type { SoundType } from '../types/keyboard';
import type { ErrorBoundaryProps } from '../types/props';

interface NetworkErrorBoundaryProps extends ErrorBoundaryProps {
  retryInterval?: number;
}

interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
}

export const NetworkErrorBoundary: React.FC<NetworkErrorBoundaryProps> = ({
  children,
  retryInterval = 30000,
  onError,
  onRecover
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const isOnline = response.ok;
      setNetworkStatus({
        isOnline,
        lastChecked: new Date()
      });

      if (isOnline && !networkStatus.isOnline) {
        onRecover?.();
        setRetryCount(0);
      }
    } catch (error) {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date()
      }));
      
      if (error instanceof Error) {
        onError?.(error, { componentStack: 'NetworkErrorBoundary' });
      }
      
      setRetryCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date()
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const intervalId = setInterval(checkConnection, retryInterval);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [retryInterval]);

  if (!networkStatus.isOnline) {
    return (
      <div role="alert" className="network-error">
        <LiveRegion>
          <h2>Network Connection Lost</h2>
          <p>Unable to connect to the server. Please check your internet connection.</p>
          <p>Last checked: {networkStatus.lastChecked.toLocaleTimeString()}</p>
          {retryCount > 0 && (
            <p>Retry attempts: {retryCount}</p>
          )}
          <button 
            onClick={checkConnection}
            className="retry-button"
          >
            Retry Connection
          </button>
        </LiveRegion>
      </div>
    );
  }

  return <>{children}</>;
};