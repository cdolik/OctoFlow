import { renderHook, act } from '@testing-library/react';
import { HashRouter, useLocation } from 'react-router-dom';
import { useSessionGuard } from './useSessionGuard';
import { getAssessmentMetadata } from '../utils/storage';

jest.mock('../utils/storage');

// Mock wrapper for router hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HashRouter>{children}</HashRouter>
);

describe('useSessionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useSessionGuard(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('validates active session correctly', async () => {
    (getAssessmentMetadata as jest.Mock).mockReturnValue({
      lastSaved: Date.now(),
      stage: 'pre-seed'
    });

    const { result } = renderHook(() => useSessionGuard(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('handles expired sessions with HashRouter navigation', async () => {
    (getAssessmentMetadata as jest.Mock).mockReturnValue({
      lastSaved: Date.now() - (31 * 60 * 1000), // 31 minutes ago
      stage: 'pre-seed'
    });

    // Also track location changes
    const { result: locationResult } = renderHook(() => useLocation(), { wrapper });
    const { result: guardResult } = renderHook(
      () => useSessionGuard({ redirectPath: '/stage-select' }),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(guardResult.current.isAuthorized).toBe(false);
    expect(locationResult.current.pathname).toBe('/stage-select');
  });

  it('allows session renewal when persistence is enabled', async () => {
    (getAssessmentMetadata as jest.Mock).mockReturnValue({
      lastSaved: Date.now() - (25 * 60 * 1000), // 25 minutes ago
      stage: 'pre-seed'
    });

    const { result } = renderHook(
      () => useSessionGuard({ persistSession: true }),
      { wrapper }
    );

    await act(async () => {
      const renewed = await result.current.renewSession();
      expect(renewed).toBe(true);
    });

    expect(result.current.isAuthorized).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('prevents session renewal when persistence is disabled', async () => {
    const { result } = renderHook(
      () => useSessionGuard({ persistSession: false }),
      { wrapper }
    );

    await act(async () => {
      const renewed = await result.current.renewSession();
      expect(renewed).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('cleans up session check interval on unmount', () => {
    jest.useFakeTimers();
    
    const { unmount } = renderHook(
      () => useSessionGuard({ persistSession: true }),
      { wrapper }
    );

    expect(setInterval).toHaveBeenCalled();
    
    unmount();
    
    expect(clearInterval).toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('handles session check errors gracefully', async () => {
    (getAssessmentMetadata as jest.Mock).mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useSessionGuard(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});