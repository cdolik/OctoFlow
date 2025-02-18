import React from 'react';
import PropTypes from 'prop-types';
import { useSessionGuard } from '../hooks/useSessionGuard';

/**
 * Higher-order component that adds flow validation to a component
 * @template P
 * @param {React.ComponentType<P>} WrappedComponent - The component to wrap
 * @returns {React.ComponentType<P & { requiredStage: import('../hooks/useSessionGuard').StageType }>}
 */
export const withFlowValidation = (WrappedComponent) => {
  function WithFlowValidation({ requiredStage, ...props }) {
    const { isLoading, isAuthorized } = useSessionGuard(requiredStage);

    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (!isAuthorized) {
      return null; // Route guard will handle redirection
    }

    return <WrappedComponent {...props} />;
  }

  WithFlowValidation.propTypes = {
    requiredStage: PropTypes.oneOf(['assessment', 'summary', 'results']).isRequired,
    ...WrappedComponent.propTypes
  };

  WithFlowValidation.displayName = `WithFlowValidation(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithFlowValidation;
};