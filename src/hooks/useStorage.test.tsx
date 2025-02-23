import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';
import { trackError } from '../utils/analytics';
import { Stage, StorageState } from '../types';

jest.mock('../utils/analytics');
jest.useFakeTimers();

describe('useStorage Hook', () => {
  const mockState: StorageState = {
    version: '1.0',
    currentStage: 'pre-seed' as Stage,
    responses: { 'question-1': 3 },
    metadata: {
      lastSaved: new Date().toISOString(),
      timeSpent: 0,
      attemptCount: 1
    }
  };

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('loads initial state correctly', () => {
    sessionStorage.setItem('octoflow', JSON.stringify(mockState));
    
    const { result } = renderHook(() => useStorage());
    
    expect(result.current.state).toEqual(mockState);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles save operations', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(true);
    });

    const saved = JSON.parse(sessionStorage.getItem('octoflow') || '');
    expect(saved).toEqual(expect.objectContaining({
      currentStage: mockState.currentStage,
      responses: mockState.responses
    }));
  });

  it('creates periodic backups', async () => {
    const { result } = renderHook(() => useStorage({
      autoSave: true,
      backupInterval: 1000
    }));

    await act(async () => {
      await result.current.saveState(mockState);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const backup = JSON.parse(sessionStorage.getItem('octoflow_backup') || '');
    expect(backup).toEqual(expect.objectContaining({
      currentStage: mockState.currentStage,
      responses: mockState.responses
    }));
  });

  it('recovers from backup when main storage fails', async () => {
    // Set up backup data
    sessionStorage.setItem('octoflow_backup', JSON.stringify(mockState));
    
    // Simulate main storage corruption
    sessionStorage.setItem('octoflow', 'corrupted data');

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const recovered = await result.current.recoverFromBackup();
      expect(recovered).toBe(true);
    });

    expect(result.current.state).toEqual(mockState);
    expect(trackError).toHaveBeenCalled();
  });

  it('merges new state with existing state', async () => {
    const { result } = renderHook(() => useStorage());

    // Save initial state
    await act(async () => {
      await result.current.saveState(mockState);
    });

    // Update with partial state
    const partialUpdate = {
      ...mockState,
      responses: { 
        ...mockState.responses,
        'question-2': 4 
      }
    };

    await act(async () => {
      await result.current.saveState(partialUpdate);
    });

    const saved = JSON.parse(sessionStorage.getItem('octoflow') || '');
    expect(saved.responses).toEqual({
      'question-1': 3,
      'question-2': 4
    });
  });

  it('handles storage errors gracefully', async () => {
    // Mock storage error
    const mockError = new Error('Storage quota exceeded');
    jest.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() => useStorage());

    await act(async () => {
      const success = await result.current.saveState(mockState);
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(trackError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        context: 'useStorage.save'
      })
    );
  });
});