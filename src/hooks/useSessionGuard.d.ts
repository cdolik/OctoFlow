export type StageType = 'assessment' | 'summary' | 'results';

export interface SessionGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
}

export function useSessionGuard(requiredStage: StageType): SessionGuardResult;