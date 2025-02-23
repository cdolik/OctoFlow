import { migrateState, validateState, createEmptyState, LATEST_VERSION } from '../../utils/storage/migrations';
import { AssessmentState } from '../../types';

describe('Storage Migrations', () => {
  const mockLegacyState: AssessmentState = {
    version: '1.0',
    responses: { 'q1': 3 },
    currentStage: 'pre-seed',
    scores: null,
    metadata: {
      lastSaved: new Date().toISOString(),
      questionCount: 1
    }
  };

  describe('migrateState', () => {
    it('migrates from version 1.0 to latest', async () => {
      const result = await migrateState(mockLegacyState);
      
      expect(result.success).toBe(true);
      expect(result.state?.version).toBe(LATEST_VERSION);
      expect(result.state?.metadata.timeSpent).toBeDefined();
      expect(result.state?.metadata.attemptCount).toBeDefined();
    });

    it('handles already migrated states', async () => {
      const currentState: AssessmentState = {
        ...mockLegacyState,
        version: LATEST_VERSION,
      };

      const result = await migrateState(currentState);
      expect(result.success).toBe(true);
      expect(result.state?.version).toBe(LATEST_VERSION);
    });

    it('handles migration failures gracefully', async () => {
      const invalidState = {
        ...mockLegacyState,
        metadata: null, // This will cause migration to fail
      } as unknown as AssessmentState;

      const result = await migrateState(invalidState);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateState', () => {
    it('validates correct state structure', () => {
      expect(validateState(mockLegacyState)).toBe(true);
    });

    it('rejects invalid stage values', () => {
      const invalidState = {
        ...mockLegacyState,
        currentStage: 'invalid-stage'
      };
      expect(validateState(invalidState as AssessmentState)).toBe(false);
    });

    it('rejects invalid response scores', () => {
      const invalidState = {
        ...mockLegacyState,
        responses: { 'q1': 5 } // Invalid score > 4
      };
      expect(validateState(invalidState)).toBe(false);
    });

    it('requires version and metadata', () => {
      const noVersion = { ...mockLegacyState, version: undefined };
      const noMetadata = { ...mockLegacyState, metadata: undefined };
      
      expect(validateState(noVersion as AssessmentState)).toBe(false);
      expect(validateState(noMetadata as AssessmentState)).toBe(false);
    });
  });

  describe('createEmptyState', () => {
    it('creates valid empty state with latest version', async () => {
      const emptyState = await createEmptyState();
      
      expect(emptyState.version).toBe(LATEST_VERSION);
      expect(emptyState.responses).toEqual({});
      expect(emptyState.currentStage).toBeNull();
      expect(validateState(emptyState)).toBe(true);
    });

    it('includes all required metadata fields', async () => {
      const emptyState = await createEmptyState();
      
      expect(emptyState.metadata).toEqual(expect.objectContaining({
        lastSaved: null,
        questionCount: 0,
        timeSpent: 0,
        isComplete: false,
        attemptCount: 1,
        lastAttempt: expect.any(String)
      }));
    });
  });
});