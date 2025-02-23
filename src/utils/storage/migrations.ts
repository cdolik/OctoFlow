import { AssessmentState, Stage } from '../../types';

interface MigrationResult {
  success: boolean;
  error?: string;
  state: AssessmentState | null;
}

type MigrationFn = (state: AssessmentState) => Promise<AssessmentState>;

const migrations: Record<string, MigrationFn> = {
  '1.0': async (state) => ({
    ...state,
    version: '1.1',
    metadata: {
      ...state.metadata,
      timeSpent: state.metadata?.timeSpent || 0,
      isComplete: false
    }
  }),
  '1.1': async (state) => ({
    ...state,
    version: '1.2',
    metadata: {
      ...state.metadata,
      attemptCount: state.metadata?.attemptCount || 1,
      lastAttempt: new Date().toISOString()
    }
  })
};

export const LATEST_VERSION = '1.2';

export async function migrateState(state: AssessmentState): Promise<MigrationResult> {
  try {
    let currentState = { ...state };
    const startVersion = currentState.version || '1.0';
    
    // Get all versions after current version
    const versions = Object.keys(migrations)
      .filter(version => version >= startVersion)
      .sort();

    // Apply migrations sequentially
    for (const version of versions) {
      try {
        currentState = await migrations[version](currentState);
      } catch (error) {
        return {
          success: false,
          error: `Migration to version ${version} failed: ${error}`,
          state: null
        };
      }
    }

    return {
      success: true,
      state: currentState
    };
  } catch (error) {
    return {
      success: false,
      error: `Migration failed: ${error}`,
      state: null
    };
  }
}

export function validateState(state: AssessmentState): boolean {
  // Required fields
  if (!state.version || !state.metadata) return false;

  // Version format
  if (!/^\d+\.\d+$/.test(state.version)) return false;

  // Stage validation
  const validStages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];
  if (state.currentStage && !validStages.includes(state.currentStage)) return false;

  // Responses validation
  if (state.responses) {
    const validScores = Object.values(state.responses)
      .every(score => Number.isInteger(score) && score >= 1 && score <= 4);
    if (!validScores) return false;
  }

  return true;
}

export async function createEmptyState(): Promise<AssessmentState> {
  return {
    version: LATEST_VERSION,
    responses: {},
    currentStage: null,
    scores: null,
    metadata: {
      lastSaved: null,
      questionCount: 0,
      timeSpent: 0,
      isComplete: false,
      attemptCount: 1,
      lastAttempt: new Date().toISOString()
    }
  };
}