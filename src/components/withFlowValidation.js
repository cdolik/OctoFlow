import React, { useEffect } from 'react';
import { validateUserFlow, validateResponses } from '../utils/flowValidator';

// Higher-order component to validate flow
export const withFlowValidation = (WrappedComponent) => {
  return function WithFlowValidation(props) {
    useEffect(() => {
      const { issues, hasErrors } = validateUserFlow();
      if (hasErrors) {
        console.error('Flow validation issues:', issues);
      }

      const { isComplete, responses } = validateResponses();
      if (!isComplete) {
        console.warn('Incomplete responses detected');
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};