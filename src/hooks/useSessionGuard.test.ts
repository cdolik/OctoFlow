import { renderHook } from '@testing-library/react';
import { useSessionGuard } from './useSessionGuard';
import { getAssessmentState, clearAssessmentState } from '../utils/storage';
import { trackError } from '../utils/analytics';

jest.mock('../utils/storage');
jest.mock('../utils/analytics');
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

describe('useSessionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authorizes when session exists and persistence is enabled', async () => {
    (getAssessmentState as jest.Mock).mockReturnValue({
      version: '1.1',
      responses: {},
      metadata: { stage: 'pre-seed' }
    });

    const { result } = renderHook(() => useSessionGuard({
      requireAuth: true,
      persistSession: true
    }));

    expect(result.current.isLoading).toBe(true);
    expect(clearAssessmentState).not.toHaveBeenCalled();

    // Wait for effect to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthorized).toBe(true);
  });

  it('cleans up session when persistence is disabled', async () => {
    (getAssessmentState as jest.Mock).mockReturnValue({
      version: '1.1',
      responses: {},
      metadata: { stage: 'pre-seed' }
    });

    renderHook(() => useSessionGuard({
      requireAuth: true,
      persistSession: false
    }));

    // Wait for effect to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(clearAssessmentState).toHaveBeenCalled();
  });

  it('handles storage errors gracefully', async () => {
    const error = new Error('Storage error');
    (getAssessmentState as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useSessionGuard());

    // Wait for effect to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.isAuthorized).toBe(false);
    expect(trackError).toHaveBeenCalledWith(error, {
      source: 'useSessionGuard',
      recoveryAttempted: true,
      recoverySuccessful: false
    });
  });

  it('allows access without auth when not required', async () => {
    (getAssessmentState as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useSessionGuard({
      requireAuth: false
    }));

    // Wait for effect to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(result.current.isAuthorized).toBe(true);
  });
});