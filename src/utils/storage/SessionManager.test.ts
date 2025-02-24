import { SessionManager } from './SessionManager';
import { StorageManager } from './storageManager';
import { createMockState } from '../../utils/testUtils';

jest.mock('./storageManager');

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockStorageManager: jest.Mocked<StorageManager>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockStorageManager = StorageManager.getInstance() as jest.Mocked<StorageManager>;
    sessionManager = SessionManager.getInstance();
  });

  afterEach(() => {
    sessionManager.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('batches state changes', async () => {
    const state1 = createMockState({ stage: 'pre-seed' });
    const state2 = createMockState({ stage: 'seed' });

    await sessionManager.queueChange(state1);
    await sessionManager.queueChange(state2);

    // Fast forward past batch interval
    jest.advanceTimersByTime(1000);

    // Should only save the most recent state
    expect(mockStorageManager.saveState).toHaveBeenCalledTimes(1);
    expect(mockStorageManager.saveState).toHaveBeenCalledWith(state2);
  });

  it('handles session timeout', () => {
    const clearStorageSpy = jest.spyOn(mockStorageManager, 'clearStorage');
    
    // Fast forward past session timeout
    jest.advanceTimersByTime(1800000 + 1);

    expect(clearStorageSpy).toHaveBeenCalled();
    expect(sessionManager.isSessionActive()).toBe(false);
  });

  it('updates last activity on state changes', async () => {
    const state = createMockState({ stage: 'pre-seed' });
    
    await sessionManager.queueChange(state);
    const initialExpiration = sessionManager.getTimeUntilExpiration();

    // Fast forward 5 minutes
    jest.advanceTimersByTime(300000);

    await sessionManager.queueChange(state);
    const newExpiration = sessionManager.getTimeUntilExpiration();

    expect(newExpiration).toBeGreaterThan(initialExpiration - 300000);
  });

  it('processes pending changes on session end', async () => {
    const state = createMockState({ stage: 'pre-seed' });
    await sessionManager.queueChange(state);

    await sessionManager.endSession();

    expect(mockStorageManager.saveState).toHaveBeenCalledWith(state);
    expect(mockStorageManager.clearStorage).toHaveBeenCalled();
  });

  it('retries failed batch processing', async () => {
    const state = createMockState({ stage: 'pre-seed' });
    mockStorageManager.saveState.mockRejectedValueOnce(new Error('Save failed'));
    mockStorageManager.saveState.mockResolvedValueOnce(true);

    await sessionManager.queueChange(state);
    
    // First attempt fails
    jest.advanceTimersByTime(1000);
    
    // Retry succeeds
    jest.advanceTimersByTime(1000);

    expect(mockStorageManager.saveState).toHaveBeenCalledTimes(2);
  });
});