/**
 * @typedef {'assessment' | 'summary' | 'results'} StageType
 */

/**
 * @typedef {Object} SessionGuardResult
 * @property {boolean} isLoading - Whether the guard is still checking the session
 * @property {boolean} isAuthorized - Whether the user is authorized to access the route
 */

declare module 'hooks/useSessionGuard' {
  export function useSessionGuard(requiredStage: StageType): SessionGuardResult;
}