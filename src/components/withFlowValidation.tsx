import React from 'react';
import { Navigate, To } from 'react-router-dom';

export type Stage = 'pre-seed' | 'seed' | 'series-a';
export type Responses = Record<string, number>;

export interface FlowValidationProps {
  currentStage: Stage;
  responses: Responses;
  stages: Stage[];
  onStepChange?: (responses: Responses) => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  redirectTo?: To;
}

export const withFlowValidation = <P extends FlowValidationProps>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithFlowValidation: React.FC<P> = (props: P) => {
    const validateFlow = (): ValidationResult => {
      const { currentStage, responses, stages } = props;
      
      if (!stages.includes(currentStage)) {
        throw new Error(`Invalid stage: ${currentStage}`);
      }

      const currentIndex = stages.indexOf(currentStage);
      const previousStage = stages[currentIndex - 1];
      
      // Check if previous stage exists and has responses
      if (previousStage && !Object.keys(responses).some(key => key.startsWith(previousStage))) {
        return {
          isValid: false,
          error: `Please complete ${previousStage} stage before proceeding`,
          redirectTo: `/assessment/${previousStage}`
        };
      }

      // Validate current stage progress
      const currentStageKeys = Object.keys(responses).filter(key => key.startsWith(currentStage));
      if (currentStageKeys.length === 0 && currentIndex > 0) {
        return {
          isValid: false,
          error: `Please start the ${currentStage} assessment`,
          redirectTo: '/stage-select'
        };
      }

      return { isValid: true };
    };

    try {
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
    } catch (error) {
      console.error('Flow validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return (
        <Navigate 
          to="/error" 
          state={{ error: errorMessage }} 
          replace 
        />
      );
    }
  };

  WithFlowValidation.displayName = `WithFlowValidation(${getDisplayName(WrappedComponent)})`;
  return WithFlowValidation;
};

function getDisplayName<P>(WrappedComponent: React.ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withFlowValidation;
