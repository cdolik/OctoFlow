import React, { useEffect, useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';
import { Stage } from '../types';

interface FlowValidationProps {
  currentStage: Stage;
  onInvalidFlow?: (error: Error) => void;
  validateStage?: (stage: Stage) => Promise<boolean>;
  children: React.ReactNode;
}

interface FlowState {
  isValid: boolean;
  error: Error | null;
  lastCompletedStage: Stage | null;
}

const stageOrder: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c'];

export function withFlowValidation<P extends FlowValidationProps>(
  WrappedComponent: React.ComponentType<P>,
  options = { enforceOrder: true }
): React.FC<P> {
  const WithFlowValidationComponent: React.FC<P> = (props) => {
    const { state } = useStorage();
    const { playSound } = useAudioFeedback();
    const [flowState, setFlowState] = useState<FlowState>({
      isValid: true,
      error: null,
      lastCompletedStage: null
    });

    const validateFlow = async (stage: Stage): Promise<boolean> => {
      // Skip validation if not enforcing order
      if (!options.enforceOrder) return true;

      const currentIndex = stageOrder.indexOf(stage);
      if (currentIndex === -1) {
        throw new Error(`Invalid stage: ${stage}`);
      }

      // First stage is always valid
      if (currentIndex === 0) return true;

      // Check if previous stage exists and is completed
      const previousStage = stageOrder[currentIndex - 1];
      const previousStageData = state?.stages?.[previousStage];

      if (!previousStageData || !previousStageData.isComplete) {
        throw new Error(`Please complete ${previousStage} before starting ${stage}`);
      }

      // Run custom validation if provided
      if (props.validateStage) {
        return props.validateStage(stage);
      }

      return true;
    };

    useEffect(() => {
      const validate = async () => {
        try {
          const isValid = await validateFlow(props.currentStage);
          
          setFlowState(prev => ({
            ...prev,
            isValid,
            error: null
          }));

          if (!isValid) {
            playSound('error');
          }
        } catch (error) {
          setFlowState(prev => ({
            ...prev,
            isValid: false,
            error: error as Error
          }));

          playSound('error');
          props.onInvalidFlow?.(error as Error);
        }
      };

      validate();
    }, [props.currentStage, state?.stages]);

    // Update last completed stage when a stage is completed
    useEffect(() => {
      if (state?.stages) {
        const lastCompleted = stageOrder.reduceRight((acc, stage) => {
          if (acc) return acc;
          return state.stages[stage]?.isComplete ? stage : null;
        }, null as Stage | null);

        setFlowState(prev => ({
          ...prev,
          lastCompletedStage: lastCompleted
        }));
      }
    }, [state?.stages]);

    if (!flowState.isValid) {
      return (
        <div role="alert" className="flow-validation-error">
          <p className="error-message">
            {flowState.error?.message || 'Invalid assessment flow'}
          </p>
          {flowState.lastCompletedStage && (
            <p className="last-completed">
              Last completed stage: {flowState.lastCompletedStage}
            </p>
          )}
          <LiveRegion>
            {flowState.error?.message || 'Invalid assessment flow'}
          </LiveRegion>
          <style jsx>{`
            .flow-validation-error {
              padding: 1rem;
              margin: 1rem 0;
              border-radius: 4px;
              background: var(--error-background);
              color: var(--error-text);
            }

            .error-message {
              margin: 0 0 0.5rem;
              font-weight: 500;
            }

            .last-completed {
              margin: 0;
              font-size: 0.875rem;
              color: var(--text-secondary);
            }
          `}</style>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithFlowValidationComponent.displayName = 
    `WithFlowValidation(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithFlowValidationComponent;
}
