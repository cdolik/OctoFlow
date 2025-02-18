import { 
  saveAssessmentResponses, 
  getAssessmentResponses, 
  updateAssessmentResponse, 
  clearAssessment, 
  getAssessmentMetadata,
  backupState, 
  restoreFromBackup 
} from '../utils/storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('Assessment Response Storage', () => {
    test('saves and retrieves assessment responses', async () => {
      const mockResponses = {
        'codeowners': 3,
        'branch-protection': 4
      };

      expect(await saveAssessmentResponses(mockResponses)).toBeTruthy();
      
      const retrieved = await getAssessmentResponses();
      expect(retrieved).toEqual(mockResponses);
    });

    test('handles invalid response data', async () => {
      expect(await saveAssessmentResponses(null)).toBeFalsy();
      expect(await saveAssessmentResponses(undefined)).toBeFalsy();
      expect(await saveAssessmentResponses('invalid')).toBeFalsy();

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
      const mockResponses = { 'test': 1 };
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

      expect(updatedMetadata.questionCount).toBe(2);
      expect(new Date(updatedMetadata.lastSaved).getTime())
        .toBeGreaterThan(new Date(firstMetadata.lastSaved).getTime());
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

    it('should handle saving and retrieving responses with versioning', () => {
      const testResponses = {
        'q1': 2,
        'q2': 3
      };

      saveAssessmentResponses(testResponses);
      const retrieved = getAssessmentResponses();
      
      expect(retrieved).toEqual(testResponses);
    });

    it('should migrate old schema to new version', () => {
      // Set up old version state
      const oldState = {
        version: '1.0',
        responses: { 'q1': 1 },
        metadata: {
          lastSaved: '2024-02-17T00:00:00.000Z',
          questionCount: 1
        }
      };
      
      sessionStorage.setItem('octoflow', JSON.stringify(oldState));
      
      // Retrieve - this should trigger migration
      const responses = getAssessmentResponses();
      const rawState = JSON.parse(sessionStorage.getItem('octoflow'));
      
      expect(responses).toEqual({ 'q1': 1 });
      expect(rawState.version).toBe('1.1');
      expect(rawState.progress).toBeDefined();
      expect(rawState.metadata.timeSpent).toBeDefined();
    });

    it('should backup and restore state', () => {
      const testResponses = { 'q1': 1 };
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

    it('should handle invalid states gracefully', () => {
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