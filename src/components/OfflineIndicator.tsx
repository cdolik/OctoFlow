import React from 'react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { LiveRegion } from './LiveRegion';

export function OfflineIndicator(): JSX.Element {
  const { isOffline, lastOnlineAt, pendingSyncs } = useOfflineStatus();

  const getStatusMessage = () => {
    if (!isOffline && pendingSyncs > 0) {
      return `Syncing ${pendingSyncs} change${pendingSyncs === 1 ? '' : 's'}...`;
    }
    if (isOffline) {
      return 'Working offline';
    }
    return 'Connected';
  };

  const getTimeSinceOnline = () => {
    if (!isOffline || !lastOnlineAt) return '';
    const minutes = Math.floor((Date.now() - lastOnlineAt.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  if (!isOffline && pendingSyncs === 0) return null;

  return (
    <div 
      className={`offline-indicator ${isOffline ? 'offline' : 'syncing'}`}
      role="status"
      aria-live="polite"
    >
      <div className="status-icon">
        {isOffline ? '⚠️' : '🔄'}
      </div>
      <div className="status-content">
        <div className="status-message">
          {getStatusMessage()}
        </div>
        {isOffline && lastOnlineAt && (
          <div className="last-online">
            Last online: {getTimeSinceOnline()}
          </div>
        )}
      </div>
      <LiveRegion>
        {`${getStatusMessage()}${isOffline ? `. ${getTimeSinceOnline()}` : ''}`}
      </LiveRegion>

      <style jsx>{`
        .offline-indicator {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
          z-index: 1000;
        }

        .offline {
          background: var(--warning-background);
          color: var(--warning-text);
        }

        .syncing {
          background: var(--info-background);
          color: var(--info-text);
        }

        .status-icon {
          font-size: 1.25rem;
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-message {
          font-weight: 500;
        }

        .last-online {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .syncing .status-icon {
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .offline-indicator {
            bottom: 0;
            right: 0;
            left: 0;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}