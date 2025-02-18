import {
  saveAssessmentResponses,
  getAssessmentResponses,
  updateAssessmentResponse,
  clearAssessment,
  getAssessmentMetadata
} from '../utils/storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
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