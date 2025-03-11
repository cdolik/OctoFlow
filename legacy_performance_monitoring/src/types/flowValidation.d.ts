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
  seriesB?: boolean;
}

export interface FlowValidationConfig {
  requirePreviousStage?: boolean;
  validateResponses?: boolean;
  allowSkipTo?: Stage[];
  seriesB?: boolean;
}

export interface WithFlowValidationProps extends FlowValidationProps {
  validationConfig?: FlowValidationConfig;
  onValidationError?: (error: string) => void;
  onStageComplete?: (stage: Stage) => void;
  seriesB?: boolean;
}