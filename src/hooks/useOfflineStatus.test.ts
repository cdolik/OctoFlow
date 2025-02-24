import { renderHook, act } from '@testing-library/react';
import { useOfflineStatus } from './useOfflineStatus';
import { useAudioFeedback } from '../components/AudioFeedback';
import { useAccessibility } from '../contexts/AccessibilityContext';

jest.mock('../components/AudioFeedback');
jest.mock('../contexts/AccessibilityContext');

describe('useOfflineStatus', () => {
  const mockPlaySound = jest.fn();
  const mockAnnounce = jest.fn();
  const mockOnline = true;
  let mockBroadcastChannel: any;

  beforeEach(() => {
    mockBroadcastChannel = {
      addEventListener: jest.fn(),
      close: jest.fn()
    };
    (global as any).BroadcastChannel = jest.fn(() => mockBroadcastChannel);
    (global as any).navigator.onLine = mockOnline;
    (global as any).navigator.serviceWorker = {
      ready: Promise.resolve({
        sync: {
          getTags: jest.fn().mockResolvedValue([])
        }
      })
    };

    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });

    (useAccessibility as jest.Mock).mockReturnValue({
      announce: mockAnnounce
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct online status', () => {
    const { result } = renderHook(() => useOfflineStatus());
    
    expect(result.current.isOffline).toBe(false);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    expect(result.current.pendingSyncs).toBe(0);
  });

  it('handles offline event', () => {
    const { result } = renderHook(() => useOfflineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOffline).toBe(true);
    expect(mockPlaySound).toHaveBeenCalledWith('error');
    expect(mockAnnounce).toHaveBeenCalledWith(
      'Connection lost. Working offline...',
      'assertive'
    );
  });

  it('handles online event', () => {
    const { result } = renderHook(() => useOfflineStatus());

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOffline).toBe(false);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    expect(mockPlaySound).toHaveBeenCalledWith('success');
    expect(mockAnnounce).toHaveBeenCalledWith(
      'Connection restored. Syncing changes...',
      'polite'
    );
  });

  it('tracks pending syncs', () => {
    const { result } = renderHook(() => useOfflineStatus());

    act(() => {
      const messageEvent = new MessageEvent('message', {
        data: { type: 'SYNC_STARTED' }
      });
      mockBroadcastChannel.addEventListener.mock.calls[0][1](messageEvent);
    });

    expect(result.current.pendingSyncs).toBe(1);

    act(() => {
      const messageEvent = new MessageEvent('message', {
        data: { type: 'SYNC_COMPLETED' }
      });
      mockBroadcastChannel.addEventListener.mock.calls[0][1](messageEvent);
    });

    expect(result.current.pendingSyncs).toBe(0);
  });

  it('prevents negative pending syncs', () => {
    const { result } = renderHook(() => useOfflineStatus());

    act(() => {
      const messageEvent = new MessageEvent('message', {
        data: { type: 'SYNC_COMPLETED' }
      });
      mockBroadcastChannel.addEventListener.mock.calls[0][1](messageEvent);
    });

    expect(result.current.pendingSyncs).toBe(0);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOfflineStatus());
    
    unmount();
    
    expect(mockBroadcastChannel.close).toHaveBeenCalled();
  });

  it('handles existing sync tags on initialization', async () => {
    (global as any).navigator.serviceWorker = {
      ready: Promise.resolve({
        sync: {
          getTags: jest.fn().mockResolvedValue(['sync-1', 'sync-2', 'other-tag'])
        }
      })
    };

    const { result } = renderHook(() => useOfflineStatus());

    // Wait for the async operation to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.pendingSyncs).toBe(2);
  });
});