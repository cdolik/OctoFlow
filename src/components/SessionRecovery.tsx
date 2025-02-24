import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageState } from '../types';
import { IndexedDBAdapter } from '../utils/storage/IndexedDBAdapter';
import { LoadingSpinner } from './LoadingSpinner';
import './styles.css';

interface SessionRecoveryProps {
  onRecover: (state: StorageState) => void;
  onDecline: () => void;
}

export function SessionRecovery({ onRecover, onDecline }: SessionRecoveryProps): JSX.Element {
  const [savedStates, setSavedStates] = useState<StorageState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSavedStates = async () => {
      try {
        const adapter = new IndexedDBAdapter();
        await adapter.initialize();
        const states = await adapter.getAllStates();
        setSavedStates(states.sort((a, b) => {
          return new Date(b.metadata.lastSaved).getTime() - 
                 new Date(a.metadata.lastSaved).getTime();
        }));
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedStates();
  }, []);

  const handleRecover = async (state: StorageState) => {
    try {
      await onRecover(state);
      navigate(`/assessment/${state.currentStage}`);
    } catch (err) {
      setError(err as Error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="medium" message="Checking for saved sessions..." />;
  }

  if (error) {
    return (
      <div role="alert" className="session-recovery-error">
        <h2>Unable to check for saved sessions</h2>
        <p>{error.message}</p>
        <button onClick={onDecline} className="button-secondary">
          Start New Session
        </button>
      </div>
    );
  }

  if (savedStates.length === 0) {
    return null;
  }

  return (
    <div className="session-recovery" role="dialog" aria-labelledby="recovery-title">
      <h2 id="recovery-title">Resume Previous Session?</h2>
      <div className="saved-sessions">
        {savedStates.map((state, index) => (
          <div key={state.currentStage} className="session-card">
            <div className="session-info">
              <h3>{state.currentStage}</h3>
              <p>Last saved: {new Date(state.metadata.lastSaved).toLocaleString()}</p>
              <p>Progress: {Math.round((state.progress.questionIndex / state.progress.totalQuestions) * 100)}%</p>
            </div>
            <div className="session-actions">
              <button
                onClick={() => handleRecover(state)}
                className="button-primary"
                autoFocus={index === 0}
              >
                Resume
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="recovery-actions">
        <button onClick={onDecline} className="button-secondary">
          Start New Session
        </button>
      </div>

      <style jsx>{`
        .session-recovery {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: var(--surface-background);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .saved-sessions {
          margin: 1.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .session-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--surface-background-elevated);
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .session-info h3 {
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }

        .session-info p {
          margin: 0.25rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .session-actions {
          display: flex;
          gap: 0.5rem;
        }

        .recovery-actions {
          margin-top: 2rem;
          text-align: center;
        }

        .button-primary {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .button-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .button-primary:hover {
          background: var(--primary-color-dark);
        }

        .button-secondary:hover {
          background: var(--surface-background-hover);
        }

        .session-recovery-error {
          text-align: center;
          padding: 2rem;
          color: var(--error-color);
        }
      `}</style>
    </div>
  );
}