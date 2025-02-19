import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionGuard } from '../hooks/useSessionGuard';

export type Stage = 'pre-seed' | 'seed' | 'series-a';
export type Responses = Record<Stage, unknown>;

export interface FlowValidationProps {
  currentStage: Stage;
  responses: Responses;
  stages: Stage[];
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  redirectTo?: string;
}

export const withFlowValidation = <P extends FlowValidationProps>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithFlowValidation: React.FC<P> = (props: P) => {
    const validateFlow = (): ValidationResult => {
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
            to={validation.redirectTo!} 
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

  WithFlowValidation.displayName = `WithFlowValidation(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithFlowValidation;
};

export default withFlowValidation;