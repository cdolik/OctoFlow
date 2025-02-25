import { renderHook, act } from '@testing-library/react';
import { useStorage } from '../hooks/useStorage';
import { StorageManager } from '../utils/storage/storageManager';
import type { AssessmentState } from '../types';

const mockState: AssessmentState = {
  version: '1.1',
  currentStage: 'pre-seed',
  responses: {},
  metadata: {
    lastSaved: new Date().toISOString(),
    timeSpent: 0,
    attemptCount: 1
  },
  progress: {
    questionIndex: 0,
    totalQuestions: 10,
    isComplete: false
  }
};

describe('Storage System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('useStorage Hook', () => {
    it('should initialize with null state', () => {
      const { result } = renderHook(() => useStorage());
      expect(result.current.state).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should save and retrieve state', async () => {
      const { result } = renderHook(() => useStorage());
      
      await act(async () => {
        await result.current.saveState(mockState);
      });

      expect(result.current.state).toEqual(mockState);
    });

    it('should handle state clearing', async () => {
      const { result } = renderHook(() => useStorage());
      
      await act(async () => {
        await result.current.saveState(mockState);
        await result.current.clearState();
      });

      expect(result.current.state).toBeNull();
    });

    it('should track session activity', () => {
      const { result } = renderHook(() => useStorage());
      expect(result.current.isSessionActive).toBe(true);
    });
  });

  describe('StorageManager', () => {
    let storageManager: StorageManager;

    beforeEach(() => {
      storageManager = StorageManager.getInstance();
    });

    it('should maintain singleton instance', () => {
      const instance1 = StorageManager.getInstance();
      const instance2 = StorageManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should handle state saves', async () => {
      const saved = await storageManager.saveState(mockState);
      expect(saved).toBe(true);

      const retrieved = await storageManager.getState();
      expect(retrieved?.responses).toEqual(mockState.responses);
      expect(retrieved?.metadata.timeSpent).toBe(mockState.metadata.timeSpent);
      expect(retrieved?.metadata.attemptCount).toBe(mockState.metadata.attemptCount);
    });

    it('should track progress correctly', async () => {
      await storageManager.saveState({
        ...mockState,
        progress: {
          questionIndex: 5,
          totalQuestions: 10,
          isComplete: false
        }
      });

      const retrieved = await storageManager.getState();
      expect(retrieved?.progress.questionIndex).toBe(5);
      expect(retrieved?.progress.totalQuestions).toBe(10);
      expect(retrieved?.progress.isComplete).toBe(false);
    });

    it('should handle backup operations', async () => {
      const backupCreated = await storageManager.createBackup(mockState);
      expect(backupCreated).toBe(true);

      // Clear current state
      await storageManager.clearStorage();
      expect(await storageManager.getState()).toBeNull();
    });
  });
});