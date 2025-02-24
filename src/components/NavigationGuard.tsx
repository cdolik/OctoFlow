import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import { useStorage } from '../hooks/useStorage';

interface NavigationGuardProps {
  when: boolean;
  onBeforeNavigate?: () => Promise<boolean>;
  message?: string;
  children?: React.ReactNode;
}

export function NavigationGuard({
  when,
  onBeforeNavigate,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  children
}: NavigationGuardProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { playSound } = useAudioFeedback();
  const { saveState, state } = useStorage();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (when) {
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }, [when, message]);

  const handleBlockedNavigation = useCallback(async (nextLocation: string) => {
    if (!when) return true;

    setIsPromptVisible(true);
    setPendingNavigation(nextLocation);
    playSound('warning');

    return false;
  }, [when, playSound]);

  const handleConfirmNavigation = useCallback(async () => {
    if (!pendingNavigation) return;

    let canNavigate = true;
    if (onBeforeNavigate) {
      canNavigate = await onBeforeNavigate();
    }

    if (canNavigate) {
      // Auto-save state if available
      if (state) {
        await saveState({
          ...state,
          metadata: {
            ...state.metadata,
            lastLocation: location.pathname
          }
        });
      }

      setIsPromptVisible(false);
      playSound('navigation');
      navigate(pendingNavigation);
    } else {
      setIsPromptVisible(false);
      playSound('error');
    }
  }, [pendingNavigation, onBeforeNavigate, state, saveState, location, navigate, playSound]);

  const handleCancelNavigation = useCallback(() => {
    setIsPromptVisible(false);
    setPendingNavigation(null);
    playSound('navigation');
  }, [playSound]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  useEffect(() => {
    let unblock: () => void;

    if (when) {
      unblock = navigate((nextLocation) => {
        const path = typeof nextLocation === 'string' ? nextLocation : nextLocation.pathname;
        handleBlockedNavigation(path);
        return false;
      });
    }

    return () => {
      if (unblock) {
        unblock();
      }
    };
  }, [when, navigate, handleBlockedNavigation]);

  return (
    <>
      {children}
      {isPromptVisible && (
        <div
          role="alertdialog"
          aria-labelledby="navigation-warning-title"
          aria-describedby="navigation-warning-message"
          className="navigation-guard-modal"
        >
          <div className="modal-content">
            <h2 id="navigation-warning-title">Warning</h2>
            <p id="navigation-warning-message">{message}</p>
            <div className="modal-actions">
              <button
                onClick={handleConfirmNavigation}
                className="confirm-button"
                autoFocus
              >
                Leave
              </button>
              <button
                onClick={handleCancelNavigation}
                className="cancel-button"
              >
                Stay
              </button>
            </div>
          </div>

          <LiveRegion>
            Navigation warning: {message}
          </LiveRegion>

          <style jsx>{`
            .navigation-guard-modal {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.5);
              z-index: 1000;
            }

            .modal-content {
              background: var(--surface-background);
              padding: 2rem;
              border-radius: 8px;
              max-width: 500px;
              width: 90%;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            h2 {
              margin: 0 0 1rem;
              color: var(--warning-text);
            }

            p {
              margin: 0 0 1.5rem;
              line-height: 1.5;
            }

            .modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
            }

            button {
              padding: 0.5rem 1.5rem;
              border-radius: 4px;
              border: none;
              cursor: pointer;
              transition: background-color 0.2s;
            }

            .confirm-button {
              background: var(--warning-color);
              color: white;
            }

            .cancel-button {
              background: var(--surface-background-elevated);
              color: var(--text-primary);
            }

            .confirm-button:hover {
              background: var(--warning-color-dark);
            }

            .cancel-button:hover {
              background: var(--surface-background-hover);
            }

            @media (max-width: 768px) {
              .modal-actions {
                flex-direction: column;
              }

              button {
                width: 100%;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}