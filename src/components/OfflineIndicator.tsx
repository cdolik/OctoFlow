import React from 'react';
import { useOfflineError } from '../hooks/useOfflineError';
import { NetworkError } from '../types/errors';

interface Props {
  onRetry?: () => void;
  className?: string;
}

export const OfflineIndicator: React.FC<Props> = ({ onRetry, className = '' }) => {
  const { isOnline, queueLength, processOfflineQueue } = useOfflineError();

  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    }
    if (queueLength > 0) {
      await processOfflineQueue();
    }
  };

  if (isOnline && queueLength === 0) {
    return null;
  }

  return (
    <div 
      role="status"
      aria-live="polite"
      className={`offline-indicator ${isOnline ? 'syncing' : 'offline'} ${className}`}
    >
      <div className="status-content">
        {!isOnline ? (
          <>
            <span className="status-icon offline-icon" aria-hidden="true">⚠</span>
            <span>You're offline</span>
            {queueLength > 0 && (
              <span className="queue-status">
                {queueLength} action{queueLength === 1 ? '' : 's'} pending
              </span>
            )}
          </>
        ) : queueLength > 0 ? (
          <>
            <span className="status-icon sync-icon" aria-hidden="true">↻</span>
            <span>Syncing {queueLength} action{queueLength === 1 ? '' : 's'}...</span>
          </>
        ) : null}
        
        <button 
          onClick={handleRetry}
          className="retry-button"
          aria-label={isOnline ? 'Retry sync' : 'Check connection'}
        >
          {isOnline ? 'Retry Sync' : 'Retry Connection'}
        </button>
      </div>

      <style jsx>{`
        .offline-indicator {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: var(--background-elevated);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .offline-indicator.offline {
          background: var(--error-background);
        }

        .offline-indicator.syncing {
          background: var(--warning-background);
        }

        .status-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-icon {
          font-size: 1.2em;
        }

        .offline-icon {
          color: var(--error-text);
        }

        .sync-icon {
          color: var(--warning-text);
          animation: spin 1s linear infinite;
        }

        .queue-status {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .retry-button {
          margin-left: auto;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          border: none;
          background: var(--primary-color);
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .retry-button:hover {
          background: var(--primary-color-dark);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};