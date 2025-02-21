declare module 'octoflow' {
  export type Stage = 'pre-seed' | 'seed' | 'series-a';
  export type StageType = 'assessment' | 'summary' | 'results';
  
  export interface Responses {
    [key: string]: number;
  }

  export interface StageInfo {
    id: Stage;
    name: string;
  }

  export interface FlowValidationProps {
    currentStage: Stage;
    responses: Record<Stage, Responses>;
    stages: Stage[];
  }

  export interface SessionGuardResult {
    isLoading: boolean;
    isAuthorized: boolean;
  }

  export interface ComponentFlowProps extends FlowValidationProps {
    stage: StageInfo;
  }
}