import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useErrorManagement } from '../hooks/useErrorManagement';
import { useOfflineError } from '../hooks/useOfflineError';
import { AssessmentError } from '../types/errors';

interface Props {
  children: React.ReactNode;
  allowedPaths?: string[];
  onNavigationBlocked?: () => void;
}

export const NavigationGuard: React.FC<Props> = ({
  children,
  allowedPaths = [],
  onNavigationBlocked
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleError } = useErrorManagement();
  const { isOnline, queueLength } = useOfflineError();

  const checkNavigation = useCallback((targetPath: string): boolean => {
    if (!isOnline && !allowedPaths.includes(targetPath)) {
      handleError(
        new AssessmentError('Navigation blocked: offline mode', {
          context: {
            component: 'NavigationGuard',
            action: 'checkNavigation',
            timestamp: new Date().toISOString()
          },
          severity: 'medium',
          recoverable: true
        })
      );
      onNavigationBlocked?.();
      return false;
    }

    if (queueLength > 0 && !allowedPaths.includes(targetPath)) {
      handleError(
        new AssessmentError('Navigation blocked: pending changes', {
          context: {
            component: 'NavigationGuard',
            action: 'checkNavigation',
            timestamp: new Date().toISOString()
          },
          severity: 'low',
          recoverable: true
        })
      );
      onNavigationBlocked?.();
      return false;
    }

    return true;
  }, [isOnline, queueLength, allowedPaths, handleError, onNavigationBlocked]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (queueLength > 0) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [queueLength]);

  useEffect(() => {
    const unblock = navigate((to) => {
      if (!checkNavigation(to.pathname)) {
        return false;
      }
      return true;
    });

    return () => unblock();
  }, [navigate, checkNavigation]);

  return (
    <div className="navigation-guard">
      {children}

      <style jsx>{`
        .navigation-guard {
          position: relative;
        }
      `}</style>
    </div>
  );
};