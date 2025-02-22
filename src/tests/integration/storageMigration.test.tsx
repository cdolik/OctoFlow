import { getAssessmentData, saveAssessmentResponses } from '../../utils/storage';
import { Stage } from '../../types';

describe('Storage Migration Integration', () => {
  const createLegacyState = (stage: Stage, responses: Record<string, number>) => ({
    version: '1.0',
    responses,
    metadata: {
      lastSaved: Date.now(),
      questionCount: Object.keys(responses).length
    }
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('migrates legacy state to current version', () => {
    const legacyState = createLegacyState('pre-seed', {
      'question1': 3,
      'question2': 4
    });

    sessionStorage.setItem('octoflow', JSON.stringify(legacyState));
    
    const migratedState = getAssessmentData();
    
    expect(migratedState.version).toBe('1.1');
    expect(migratedState.responses).toEqual(legacyState.responses);
    expect(migratedState.metadata).toHaveProperty('timeSpent');
    expect(migratedState.metadata).toHaveProperty('attemptCount');
  });

  it('preserves responses during migration', () => {
    const responses = {
      'branch-protection': 3,
      'deployment-automation': 4
    };

    const legacyState = createLegacyState('seed', responses);
    sessionStorage.setItem('octoflow', JSON.stringify(legacyState));

    saveAssessmentResponses(responses);
    const migratedState = getAssessmentData();

    expect(migratedState.responses).toEqual(responses);
  });

  it('handles corrupted state gracefully', () => {
    sessionStorage.setItem('octoflow', 'invalid-json');
    
    const state = getAssessmentData();
    expect(state.version).toBe('1.1');
    expect(state.responses).toEqual({});
  });

  it('maintains stage progress during migration', () => {
    const stage: Stage = 'pre-seed';
    const responses = { 'question1': 3 };
    
    const legacyState = createLegacyState(stage, responses);
    sessionStorage.setItem('octoflow', JSON.stringify(legacyState));

    const migratedState = getAssessmentData();
    expect(migratedState.currentStage).toBe(stage);
    expect(migratedState.progress.completed).toEqual([]);
    expect(migratedState.progress.lastAccessed).toBeDefined();
  });
});