import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionGuard } from '../hooks/useSessionGuard';

export type Stage = 'pre-seed' | 'seed' | 'series-a';
export type Responses = Record<Stage, any>;

interface FlowValidationProps {
  currentStage: Stage;
  responses: Responses;
  stages: Stage[];
}

export const withFlowValidation = <P extends FlowValidationProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithFlowValidation(props: P) {
    const validateFlow = () => {
      const { currentStage, responses, stages } = props;
      
      // Validate stage exists
      if (!stages.includes(currentStage)) {
        throw new Error(`Invalid stage: ${currentStage}`);
      }

      // Validate stage order
      const currentIndex = stages.indexOf(currentStage);
      const previousStage = stages[currentIndex - 1];
      
      if (previousStage && !responses[previousStage]) {
        return {
          isValid: false,
          error: `Please complete ${previousStage} before proceeding`,
          redirectTo: `/assessment/${previousStage}`
        };
      }

      return { isValid: true };
    };

    try {
      const validation = validateFlow();
      
      if (!validation.isValid) {
        return (
          <Navigate 
            to={validation.redirectTo} 
            state={{ error: validation.error }} 
            replace 
          />
        );
      }

      return <WrappedComponent {...props} />;
    } catch (error) {
      console.error('Flow validation error:', error);
      return (
        <Navigate 
          to="/error" 
          state={{ error: (error as Error).message }} 
          replace 
        />
      );
    }
  };
};

export default withFlowValidation;