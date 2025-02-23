import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useError } from '../contexts/ErrorContext';
import { useStorage } from '../hooks/useStorage';
import { validateStorageState } from '../utils/storageValidation';

interface NavigationGuardProps {
  children: React.ReactNode;
  onBlockedNavigation?: () => void;
}

const NavigationGuard: React.FC<NavigationGuardProps> = ({
  children,
  onBlockedNavigation
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attempts, canAttemptRecovery } = useError();
  const { state: storageState } = useStorage();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (storageState && !validateStorageState(storageState).isValid) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    const handleNavigation = (event: PopStateEvent) => {
      if (storageState && !validateStorageState(storageState).isValid) {
        event.preventDefault();
        onBlockedNavigation?.();
        return;
      }

      // Block navigation if we're in an error state and can't recover
      if (attempts > 0 && !canAttemptRecovery()) {
        event.preventDefault();
        onBlockedNavigation?.();
        return;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [storageState, attempts, canAttemptRecovery, onBlockedNavigation]);

  // Protect routes during error states
  useEffect(() => {
    const protectedRoutes = ['/assessment', '/summary', '/results'];
    const isProtectedRoute = protectedRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isProtectedRoute && attempts > 0 && !canAttemptRecovery()) {
      navigate('/', { replace: true });
    }
  }, [location, attempts, canAttemptRecovery, navigate]);

  return <>{children}</>;
};

export default NavigationGuard;