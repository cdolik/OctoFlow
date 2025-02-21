import React, { useEffect } from 'react';

interface NavigationGuardProps {
  hasUnsavedChanges: boolean;
  message?: string;
}

const NavigationGuard: React.FC<NavigationGuardProps> = ({ 
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}) => {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  return null;
};

export default NavigationGuard;