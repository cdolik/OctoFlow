import React, { useEffect } from 'react';

interface NavigationGuardProps {
  hasUnsavedChanges: boolean;
}

const NavigationGuard: React.FC<NavigationGuardProps> = ({ hasUnsavedChanges }) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return null;
};

export default NavigationGuard;