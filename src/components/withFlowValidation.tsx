import React, { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionGuard } from '../hooks/useSessionGuard';

export type Stage = 'pre-seed' | 'seed' | 'series-a';

export interface FlowValidationProps {
  currentStage: Stage;
  responses: Record<Stage, unknown>;
  stages: Stage[];
}

export function withFlowValidation<P extends FlowValidationProps>(
  WrappedComponent: ComponentType<P>
) {
  return function WithFlowValidationComponent(props: P) {
    const { currentStage, responses, stages } = props;

    // Validate the flow
    const validateFlow = (): { isValid: boolean; redirectTo?: string; error?: string } => {
      if (!stages.includes(currentStage)) {
        return {
          isValid: false,
          error: `Invalid stage: ${currentStage}`,
          redirectTo: '/stage-select'
        };
      }

      const currentIndex = stages.indexOf(currentStage);
      const previousStage = stages[currentIndex - 1];
      
      if (previousStage && !responses[previousStage]) {
        return {
          isValid: false,
          error: `Please complete ${previousStage} stage first`,
          redirectTo: `/assessment/${previousStage}`
        };
      }

      return { isValid: true };
    };

    // Use the session guard hook
    const { isLoading, isAuthorized } = useSessionGuard(currentStage);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthorized) {
      return (
        <Navigate 
          to="/stage-select" 
          replace 
          state={{ error: "Please complete previous stages first" }}
        />
      );
    }

    const validation = validateFlow();
    if (!validation.isValid && validation.redirectTo) {
      return (
        <Navigate 
          to={validation.redirectTo} 
          state={{ error: validation.error }} 
          replace 
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default withFlowValidation;