import { 
  saveAssessmentResponses, 
  getAssessmentResponses, 
  updateAssessmentResponse, 
  clearAssessment, 
  getAssessmentMetadata,
  backupState, 
  restoreFromBackup,
  AssessmentState
} from '../utils/storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('Assessment Response Storage', () => {
    test('saves and retrieves assessment responses', () => {
      const mockResponses: Record<string, number> = {
        'codeowners': 3,
        'branch-protection': 4
      };
      
      expect(saveAssessmentResponses(mockResponses)).toBeTruthy();
      const retrieved = getAssessmentResponses();
      expect(retrieved).toEqual(mockResponses);
    });

    test('handles invalid response data', () => {
      expect(saveAssessmentResponses(null as unknown as Record<string, number>)).toBeFalsy();
      expect(saveAssessmentResponses(undefined as unknown as Record<string, number>)).toBeFalsy();
      expect(saveAssessmentResponses('invalid' as unknown as Record<string, number>)).toBeFalsy();
      
      const retrieved = getAssessmentResponses();
      expect(retrieved).toEqual({});
    });

    test('updates individual responses', () => {
      expect(updateAssessmentResponse('codeowners', 3)).toBeTruthy();
      expect(updateAssessmentResponse('branch-protection', 4)).toBeTruthy();
      
      const retrieved = getAssessmentResponses();
      expect(retrieved).toEqual({
        'codeowners': 3,
        'branch-protection': 4
      });
    });

    test('preserves existing responses when updating', () => {
      saveAssessmentResponses({
        'codeowners': 3,
        'branch-protection': 4
      });
      
      updateAssessmentResponse('deployment-automation', 2);
      const retrieved = getAssessmentResponses();
      expect(retrieved).toEqual({
        'codeowners': 3,
        'branch-protection': 4,
        'deployment-automation': 2
      });
    });
  });

  describe('Metadata Management', () => {
    test('stores and retrieves metadata', () => {
      const mockResponses: Record<string, number> = { 'test': 1 };
      saveAssessmentResponses(mockResponses);
      
      const metadata = getAssessmentMetadata();
      expect(metadata).toEqual(expect.objectContaining({
        lastSaved: expect.any(String),
        questionCount: 1
      }));
    });

    test('updates metadata on response changes', () => {
      saveAssessmentResponses({ 'q1': 1 });
      const firstMetadata = getAssessmentMetadata();
      
      updateAssessmentResponse('q2', 2);
      const updatedMetadata = getAssessmentMetadata();
      
      expect(updatedMetadata?.questionCount).toBe(2);
      expect(new Date(updatedMetadata?.lastSaved || '').getTime())
        .toBeGreaterThan(new Date(firstMetadata?.lastSaved || '').getTime());
    });
  });

  describe('State Versioning', () => {
    test('handles version migration', () => {
      // Simulate old state format
      const oldState = {
        responses: { 'test': 1 },
        version: '0.9'
      };
      sessionStorage.setItem('octoflow', JSON.stringify(oldState));
      
      const retrieved = getAssessmentResponses();
      expect(retrieved).toEqual({ 'test': 1 });
    });

    test('clears invalid state', () => {
      sessionStorage.setItem('octoflow', 'invalid json');
      
      const retrieved = getAssessmentResponses();
      expect(retrieved).toEqual({});
      expect(sessionStorage.getItem('octoflow')).toBeNull();
    });

    test('should handle saving and retrieving responses with versioning', () => {
      const testResponses: Record<string, number> = {
        'q1': 2,
        'q2': 3
      };
      saveAssessmentResponses(testResponses);
      const retrieved = getAssessmentResponses();
      
      expect(retrieved).toEqual(testResponses);
    });

    test('should migrate old schema to new version', () => {
      // Set up old version state
      const oldState: Partial<AssessmentState> = {
        version: '1.0',
        responses: { 'q1': 1 },
        metadata: {
          lastSaved: '2024-02-17T00:00:00.000Z',
          questionCount: 1,
          timeSpent: 0,
          attemptCount: 0
        }
      };
      
      sessionStorage.setItem('octoflow', JSON.stringify(oldState));
      
      // Retrieve - this should trigger migration
      const responses = getAssessmentResponses();
      const rawState = JSON.parse(sessionStorage.getItem('octoflow') || '{}') as AssessmentState;
      
      expect(responses).toEqual({ 'q1': 1 });
      expect(rawState.version).toBe('1.1');
      expect(rawState.progress).toBeDefined();
      expect(rawState.metadata.timeSpent).toBeDefined();
    });

    test('should backup and restore state', () => {
      const testResponses: Record<string, number> = { 'q1': 1 };
      saveAssessmentResponses(testResponses);
      
      // Create backup
      backupState();
      
      // Clear session storage
      sessionStorage.clear();
      
      // Restore from backup
      const restored = restoreFromBackup();
      const retrievedResponses = getAssessmentResponses();
      
      expect(restored).toBe(true);
      expect(retrievedResponses).toEqual(testResponses);
    });

    test('should handle invalid states gracefully', () => {
      sessionStorage.setItem('octoflow', 'invalid json');
      
      const responses = getAssessmentResponses();
      expect(responses).toEqual({});
    });
  });

  describe('Error Recovery', () => {
    test('recovers from storage errors', () => {
      // Simulate storage error
      jest.spyOn(sessionStorage, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage full');
      });
      
      expect(saveAssessmentResponses({ 'test': 1 })).toBeFalsy();
      expect(getAssessmentResponses()).toEqual({});
    });

    test('clears assessment data', () => {
      saveAssessmentResponses({ 'test': 1 });
      expect(clearAssessment()).toBeTruthy();
      expect(getAssessmentResponses()).toEqual({});
      expect(getAssessmentMetadata()).toBeNull();
    });
  });
});