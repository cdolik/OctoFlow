import { Stage } from './index';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  redirectTo?: string;
}

export interface FlowValidationProps {
  stage: Stage;
  responses: Record<string, number>;
}

export interface FlowValidationState {
  currentStage: Stage;
  previousStage?: Stage;
  completedStages: Stage[];
  lastValidated: number;
}

export interface FlowValidationConfig {
  requirePreviousStage?: boolean;
  validateResponses?: boolean;
  allowSkipTo?: Stage[];
}

export interface WithFlowValidationProps extends FlowValidationProps {
  validationConfig?: FlowValidationConfig;
  onValidationError?: (error: string) => void;
  onStageComplete?: (stage: Stage) => void;
}